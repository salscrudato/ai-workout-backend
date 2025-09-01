import { z } from 'zod';
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
export const createUser = asyncHandler(async (req, res) => {
    const validatedData = CreateUserSchema.parse(req.body ?? {});
    // Extract profile fields from validated data
    const { email, ...profileFields } = validatedData;
    let user;
    if (email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            user = existingUser;
        }
        else {
            user = await UserModel.create({ email });
        }
    }
    else {
        user = await UserModel.create({});
    }
    // Create or update profile if profile fields are provided
    let profile = null;
    if (Object.keys(profileFields).length > 0) {
        profile = await ProfileModel.findOneAndUpdate({ userId: user.id }, {
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
//# sourceMappingURL=user.js.map