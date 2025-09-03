"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfile = exports.patchProfile = exports.getProfile = void 0;
const zod_1 = require("zod");
const errors_1 = require("../middlewares/errors");
const Profile_1 = require("../models/Profile");
const validation_1 = require("../utils/validation");
const CreateProfileSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    experience: zod_1.z.enum(['beginner', 'intermediate', 'advanced']),
    goals: zod_1.z.array(zod_1.z.string()),
    equipmentAvailable: zod_1.z.array(zod_1.z.string()),
    age: zod_1.z.number().int().min(13).max(120).optional(),
    sex: zod_1.z.enum(['male', 'female', 'prefer_not_to_say']).optional(),
    height_ft: zod_1.z.number().int().min(0).max(10).optional(),
    height_in: zod_1.z.number().int().min(0).max(11).optional(),
    weight_lb: zod_1.z.number().positive().optional(),
    injury_notes: zod_1.z.string().optional(),
    constraints: zod_1.z.array(zod_1.z.string()),
    health_ack: zod_1.z.boolean(),
    data_consent: zod_1.z.boolean()
});
const UpdateProfileSchema = zod_1.z.object({
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
exports.getProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId || !(0, validation_1.isValidObjectId)(userId)) {
        res.status(400).json({ error: 'Invalid userId format' });
        return;
    }
    const profile = await Profile_1.ProfileModel.findOne({ userId });
    if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
    }
    res.json({ profile });
});
exports.patchProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId || !(0, validation_1.isValidObjectId)(userId)) {
        res.status(400).json({ error: 'Invalid userId format' });
        return;
    }
    const validatedData = UpdateProfileSchema.parse(req.body);
    const profile = await Profile_1.ProfileModel.findOneAndUpdate({ userId }, {
        userId,
        experience: validatedData.experience || 'beginner',
        goals: validatedData.goals || [],
        equipmentAvailable: validatedData.equipmentAvailable || [],
        age: validatedData.age,
        sex: validatedData.sex || 'prefer_not_to_say',
        height_ft: validatedData.height_ft,
        height_in: validatedData.height_in,
        weight_lb: validatedData.weight_lb,
        injury_notes: validatedData.injury_notes,
        constraints: validatedData.constraints || [],
        health_ack: validatedData.health_ack || false,
        data_consent: validatedData.data_consent || false,
    }, { upsert: true });
    res.json({ profile });
});
exports.createProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const data = CreateProfileSchema.parse(req.body);
    // Check if profile already exists for this user
    const existingProfile = await Profile_1.ProfileModel.findOne({ userId: data.userId });
    if (existingProfile) {
        res.status(409).json({ error: 'Profile already exists for this user' });
        return;
    }
    const profile = await Profile_1.ProfileModel.create(data);
    res.status(201).json({ profile });
});
//# sourceMappingURL=profile.js.map