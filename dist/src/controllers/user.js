"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.createUser = void 0;
const zod_1 = require("zod");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const errors_1 = require("../middlewares/errors");
const User_1 = require("../models/User");
const Profile_1 = require("../models/Profile");
const CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    // Profile fields (all optional)
    experience: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    goals: zod_1.z.array(zod_1.z.string()).optional(),
    equipmentAvailable: zod_1.z.array(zod_1.z.string()).optional(),
    age: zod_1.z.number().int().min(13).max(120).optional(),
    sex: zod_1.z.enum(['male', 'female', 'prefer_not_to_say']).optional(),
    height_ft: zod_1.z.number().int().min(0).max(10).optional(),
    height_in: zod_1.z.number().int().min(0).max(11).optional(),
    weight_lb: zod_1.z.number().positive().optional(),
    injury_notes: zod_1.z.string().optional(),
    constraints: zod_1.z.array(zod_1.z.string()).optional(),
    health_ack: zod_1.z.boolean().optional(),
    data_consent: zod_1.z.boolean().optional()
});
exports.createUser = (0, errors_1.asyncHandler)(async (req, res) => {
    const validatedData = CreateUserSchema.parse(req.body ?? {});
    // Extract profile fields from validated data
    const { email, ...profileFields } = validatedData;
    let user;
    if (email) {
        const existingUser = await User_1.UserModel.findByEmail(email);
        if (existingUser) {
            user = existingUser;
        }
        else {
            user = await User_1.UserModel.create({ email });
        }
    }
    else {
        user = await User_1.UserModel.create({});
    }
    // Create or update profile if profile fields are provided
    let profile = null;
    if (Object.keys(profileFields).length > 0) {
        profile = await Profile_1.ProfileModel.findOneAndUpdate({ userId: user.id }, {
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
        }, { upsert: true });
    }
    res.status(201).json({
        user,
        profile: profile || undefined
    });
});
const AuthSchema = zod_1.z.object({
    idToken: zod_1.z.string()
});
exports.authenticateUser = (0, errors_1.asyncHandler)(async (req, res) => {
    const { idToken } = AuthSchema.parse(req.body);
    try {
        // Verify the Firebase ID token
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(idToken);
        // Get or create user based on Firebase Auth user
        let user = await User_1.UserModel.findByEmail(decodedToken.email);
        if (!user) {
            // Create new user from Firebase Auth data
            user = await User_1.UserModel.create({
                email: decodedToken.email,
                firebaseUid: decodedToken.uid
            });
        }
        // Check if user has a profile
        const profile = await Profile_1.ProfileModel.findOne({ userId: user.id });
        res.json({
            user,
            profile,
            token: idToken, // Return the token for frontend to store
            isNewUser: !profile
        });
    }
    catch (error) {
        console.error('Authentication failed:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});
//# sourceMappingURL=user.js.map