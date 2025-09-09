"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfile = exports.patchProfile = exports.getProfile = void 0;
const errors_1 = require("../middlewares/errors");
const Profile_1 = require("../models/Profile");
const validation_1 = require("../utils/validation");
const validation_2 = require("../utils/validation");
exports.getProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId || !(0, validation_1.isValidObjectId)(userId)) {
        throw new errors_1.AppError('Invalid userId format', 400, 'INVALID_USER_ID');
    }
    const profile = await Profile_1.ProfileModel.findOne({ userId });
    if (!profile) {
        throw new errors_1.AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }
    res.json({ profile });
});
exports.patchProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId || !(0, validation_1.isValidObjectId)(userId)) {
        throw new errors_1.AppError('Invalid userId format', 400, 'INVALID_USER_ID');
    }
    const validatedData = validation_2.UpdateProfileSchema.parse(req.body);
    // Only pass provided fields; model merges and preserves existing values
    const profile = await Profile_1.ProfileModel.findOneAndUpdate({ userId }, { ...validatedData }, { upsert: true });
    res.json({ profile });
});
exports.createProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const data = validation_2.CreateProfileSchema.parse(req.body);
    const existingProfile = await Profile_1.ProfileModel.findOne({ userId: data.userId });
    if (existingProfile) {
        throw new errors_1.AppError('Profile already exists for this user', 409, 'PROFILE_EXISTS');
    }
    const profile = await Profile_1.ProfileModel.create(data);
    res.status(201).json({ profile });
});
//# sourceMappingURL=profile.js.map