import { Request, Response } from 'express';
import admin from 'firebase-admin';
import pino from 'pino';
import { asyncHandler, AppError } from '../middlewares/errors';
import { UserModel, User } from '../models/User';
import { ProfileModel, Profile } from '../models/Profile';
import {
  CreateUserSchema,
  AuthSchema,
  CreateUserInput,
  AuthInput
} from '../schemas/validation';

// Initialize logger for this controller
const baseLogger = pino({
  name: 'user-controller',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

// Create logger wrapper that accepts any parameters
const logger = {
  info: (msg: string, obj?: any) => baseLogger.info(obj || {}, msg),
  error: (msg: string, obj?: any) => baseLogger.error(obj || {}, msg),
  warn: (msg: string, obj?: any) => baseLogger.warn(obj || {}, msg),
  debug: (msg: string, obj?: any) => baseLogger.debug(obj || {}, msg),
};

/**
 * Creates a new user with optional profile data
 *
 * @route POST /v1/users
 * @access Public
 * @param req.body - User creation data (validated against CreateUserSchema)
 * @returns Created user and profile (if provided)
 */
export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  const startTime = Date.now();

  try {
    const validatedData: CreateUserInput = CreateUserSchema.parse(req.body ?? {});
    logger.info('Creating user', { requestId, hasEmail: !!validatedData.email });

    // Extract profile fields from validated data
    const { email, ...profileFields } = validatedData;

    let user: User;
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        logger.info('User already exists', { requestId, userId: existingUser.id });
        user = existingUser;
      } else {
        user = await UserModel.create({ email });
        logger.info('New user created', { requestId, userId: user.id });
      }
    } else {
      user = await UserModel.create({});
      logger.info('Anonymous user created', { requestId, userId: user.id });
    }

    // Create or update profile if profile fields are provided
    let profile: Profile | null = null;
    if (Object.keys(profileFields).length > 0) {
      if (!user.id) {
        throw new AppError('User ID is required for profile creation', 400, 'INVALID_USER_ID');
      }

      profile = await ProfileModel.findOneAndUpdate(
        { userId: user.id },
        {
          userId: user.id,
          experience: profileFields.experience || 'beginner',
          goals: profileFields.goals || [],
          equipmentAvailable: profileFields.equipmentAvailable || [],
          age: profileFields.age,
          sex: profileFields.sex || 'prefer_not_to_say',
          height_ft: profileFields.height_ft,
          height_in: profileFields.height_in,
          weight_lb: profileFields.weight_lb,
          injury_notes: profileFields.injury_notes,
          constraints: profileFields.constraints || [],
          health_ack: profileFields.health_ack || false,
          data_consent: profileFields.data_consent || false,
        },
        { upsert: true }
      );
      logger.info('Profile created/updated', { requestId, userId: user.id, profileId: profile?.id });
    }

    const responseTime = Date.now() - startTime;
    logger.info('User creation completed', { requestId, userId: user.id, responseTime });

    res.status(201).json({
      user,
      profile: profile || undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('User creation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    });
    throw error;
  }
});

/**
 * Authenticates a user using Firebase ID token
 *
 * @route POST /v1/auth/authenticate
 * @access Public
 * @param req.body - Authentication data with Firebase ID token
 * @returns User data, profile, and authentication status
 */
export const authenticateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  const startTime = Date.now();

  try {
    const { idToken }: AuthInput = AuthSchema.parse(req.body);
    logger.info('Authenticating user', { requestId });

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken, true); // checkRevoked = true

    if (!decodedToken.email) {
      throw new AppError('Email is required for authentication', 400, 'EMAIL_REQUIRED');
    }

    logger.debug('Token verified', { requestId, uid: decodedToken.uid, email: decodedToken.email });

    // Get or create user based on Firebase Auth user
    let user = await UserModel.findByEmail(decodedToken.email);
    let isNewUser = false;

    if (!user) {
      // Create new user from Firebase Auth data
      user = await UserModel.create({
        email: decodedToken.email,
        firebaseUid: decodedToken.uid
      });
      isNewUser = true;
      logger.info('New user created from auth', { requestId, userId: user.id });
    }

    if (!user.id) {
      throw new AppError('Failed to create or retrieve user', 500, 'USER_CREATION_FAILED');
    }

    // Check if user has a profile
    const profile = await ProfileModel.findOne({ userId: user.id });

    const responseTime = Date.now() - startTime;
    logger.info('Authentication completed', {
      requestId,
      userId: user.id,
      isNewUser: isNewUser || !profile,
      responseTime
    });

    res.json({
      user,
      profile,
      token: idToken, // Return the token for frontend to store
      isNewUser: isNewUser || !profile,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof AppError) {
      throw error;
    }

    // Handle Firebase auth errors
    if (error instanceof Error) {
      logger.error('Authentication failed', {
        requestId,
        error: error.message,
        responseTime
      });

      if (error.message.includes('Firebase ID token')) {
        throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
      }
    }

    logger.error('Unexpected authentication error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    });

    throw new AppError('Authentication failed', 401, 'AUTH_ERROR');
  }
});