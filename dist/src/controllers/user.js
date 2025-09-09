"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.createUser = void 0;
const tslib_1 = require("tslib");
const firebase_admin_1 = tslib_1.__importDefault(require("firebase-admin"));
const pino_1 = tslib_1.__importDefault(require("pino"));
const errors_1 = require("../middlewares/errors");
const User_1 = require("../models/User");
const Profile_1 = require("../models/Profile");
const validation_1 = require("../utils/validation");
const baseLogger = (0, pino_1.default)({
    name: 'user-controller',
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});
const logger = {
    info: (msg, obj) => baseLogger.info(obj || {}, msg),
    error: (msg, obj) => baseLogger.error(obj || {}, msg),
    warn: (msg, obj) => baseLogger.warn(obj || {}, msg),
    debug: (msg, obj) => baseLogger.debug(obj || {}, msg),
};
exports.createUser = (0, errors_1.asyncHandler)(async (req, res) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    const startTime = Date.now();
    try {
        const validatedData = validation_1.CreateUserSchema.parse(req.body ?? {});
        logger.info('Creating user', { requestId, hasEmail: !!validatedData.email });
        const { email, ...profileFields } = validatedData;
        let user;
        if (email) {
            const existingUser = await User_1.UserModel.findByEmail(email);
            if (existingUser) {
                logger.info('User already exists', { requestId, userId: existingUser.id });
                user = existingUser;
            }
            else {
                user = await User_1.UserModel.create({ email });
                logger.info('New user created', { requestId, userId: user.id });
            }
        }
        else {
            user = await User_1.UserModel.create({});
            logger.info('Anonymous user created', { requestId, userId: user.id });
        }
        let profile = null;
        if (Object.keys(profileFields).length > 0) {
            if (!user.id) {
                throw new errors_1.AppError('User ID is required for profile creation', 400, 'INVALID_USER_ID');
            }
            const update = {};
            for (const [k, v] of Object.entries(profileFields)) {
                if (v !== undefined)
                    update[k] = v;
            }
            profile = await Profile_1.ProfileModel.findOneAndUpdate({ userId: user.id }, update, { upsert: true });
            logger.info('Profile created/updated', { requestId, userId: user.id, profileId: profile?.id });
        }
        const responseTime = Date.now() - startTime;
        logger.info('User creation completed', { requestId, userId: user.id, responseTime });
        res.status(201).json({
            user,
            profile: profile || undefined,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('User creation failed', {
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });
        throw error;
    }
});
exports.authenticateUser = (0, errors_1.asyncHandler)(async (req, res) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    const startTime = Date.now();
    try {
        const { idToken } = validation_1.AuthSchema.parse(req.body);
        logger.info('Authenticating user', { requestId });
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(idToken, true);
        if (!decodedToken.email) {
            throw new errors_1.AppError('Email is required for authentication', 400, 'EMAIL_REQUIRED');
        }
        logger.debug('Token verified', { requestId, uid: decodedToken.uid, email: decodedToken.email });
        let user = await User_1.UserModel.findByEmail(decodedToken.email);
        let isNewUser = false;
        if (!user) {
            user = await User_1.UserModel.create({
                email: decodedToken.email,
                firebaseUid: decodedToken.uid
            });
            isNewUser = true;
            logger.info('New user created from auth', { requestId, userId: user.id });
        }
        if (!user.id) {
            throw new errors_1.AppError('Failed to create or retrieve user', 500, 'USER_CREATION_FAILED');
        }
        const profile = await Profile_1.ProfileModel.findOne({ userId: user.id });
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
            token: idToken,
            isNewUser: isNewUser || !profile,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        if (error instanceof errors_1.AppError) {
            throw error;
        }
        if (error instanceof Error) {
            logger.error('Authentication failed', {
                requestId,
                error: error.message,
                responseTime
            });
            if (error.message.includes('Firebase ID token')) {
                throw new errors_1.AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
            }
        }
        logger.error('Unexpected authentication error', {
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });
        throw new errors_1.AppError('Authentication failed', 401, 'AUTH_ERROR');
    }
});
//# sourceMappingURL=user.js.map