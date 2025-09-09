import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middlewares/errors';
import { ProfileModel } from '../models/Profile';
import { isValidObjectId } from '../utils/validation';
import { CreateProfileSchema, UpdateProfileSchema } from '../utils/validation';

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  if (!userId || !isValidObjectId(userId)) {
    throw new AppError('Invalid userId format', 400, 'INVALID_USER_ID');
  }
  const profile = await ProfileModel.findOne({ userId });
  if (!profile) {
    throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
  }
  res.json({ profile });
});

export const patchProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  if (!userId || !isValidObjectId(userId)) {
    throw new AppError('Invalid userId format', 400, 'INVALID_USER_ID');
  }
  const validatedData = UpdateProfileSchema.parse(req.body);
  // Only pass provided fields; model merges and preserves existing values
  const profile = await ProfileModel.findOneAndUpdate({ userId }, { ...validatedData }, { upsert: true });
  res.json({ profile });
});

export const createProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = CreateProfileSchema.parse(req.body);
  const existingProfile = await ProfileModel.findOne({ userId: data.userId });
  if (existingProfile) {
    throw new AppError('Profile already exists for this user', 409, 'PROFILE_EXISTS');
  }
  const profile = await ProfileModel.create(data as any);
  res.status(201).json({ profile });
});