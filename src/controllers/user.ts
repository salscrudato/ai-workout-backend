import { Request, Response } from 'express';
import { z } from 'zod';
import admin from 'firebase-admin';
import { asyncHandler } from '../middlewares/errors';
import { UserModel } from '../models/User';
import { ProfileModel } from '../models/Profile';

const CreateUserSchema = z.object({
  email: z.string().email().optional(),
  // Profile fields (all optional)
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  goals: z.array(z.string()).optional(),
  equipmentAvailable: z.array(z.string()).optional(),
  age: z.number().int().min(13).max(120).optional(),
  sex: z.enum(['male', 'female', 'prefer_not_to_say']).optional(),
  height_ft: z.number().int().min(0).max(10).optional(),
  height_in: z.number().int().min(0).max(11).optional(),
  weight_lb: z.number().positive().optional(),
  injury_notes: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  health_ack: z.boolean().optional(),
  data_consent: z.boolean().optional()
});

export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = CreateUserSchema.parse(req.body ?? {});

  // Extract profile fields from validated data
  const { email, ...profileFields } = validatedData;

  let user;
  if (email) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      user = existingUser;
    } else {
      user = await UserModel.create({ email });
    }
  } else {
    user = await UserModel.create({});
  }

  // Create or update profile if profile fields are provided
  let profile = null;
  if (Object.keys(profileFields).length > 0) {
    profile = await ProfileModel.findOneAndUpdate(
      { userId: user.id! },
      {
        userId: user.id!,
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
  }

  res.status(201).json({
    user,
    profile: profile || undefined
  });
});

const AuthSchema = z.object({
  idToken: z.string()
});

export const authenticateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { idToken } = AuthSchema.parse(req.body);

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Get or create user based on Firebase Auth user
    let user = await UserModel.findByEmail(decodedToken.email!);

    if (!user) {
      // Create new user from Firebase Auth data
      user = await UserModel.create({
        email: decodedToken.email!,
        firebaseUid: decodedToken.uid
      });
    }

    // Check if user has a profile
    const profile = await ProfileModel.findOne({ userId: user.id! });

    res.json({
      user,
      profile,
      token: idToken, // Return the token for frontend to store
      isNewUser: !profile
    });
  } catch (error) {
    console.error('Authentication failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});