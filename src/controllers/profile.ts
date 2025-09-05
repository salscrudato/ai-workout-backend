import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/errors';
import { ProfileModel } from '../models/Profile';
import { isValidObjectId } from '../utils/validation';

const CreateProfileSchema = z.object({
  userId: z.string().min(1),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.array(z.string()),
  equipmentAvailable: z.array(z.string()),
  age: z.number().int().min(13).max(120).optional(),
  sex: z.enum(['male', 'female', 'prefer_not_to_say']).optional(),
  height_ft: z.number().int().min(0).max(10).optional(),
  height_in: z.number().int().min(0).max(11).optional(),
  weight_lb: z.number().positive().optional(),
  injury_notes: z.string().optional(),
  constraints: z.array(z.string()),
  health_ack: z.boolean(),
  data_consent: z.boolean()
});

const UpdateProfileSchema = z.object({
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

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    res.status(400).json({ error: 'Invalid userId format' });
    return;
  }

  const profile = await ProfileModel.findOne({ userId });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  res.json({ profile });
});

export const patchProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    res.status(400).json({ error: 'Invalid userId format' });
    return;
  }

  const validatedData = UpdateProfileSchema.parse(req.body);

  const profile = await ProfileModel.findOneAndUpdate(
    { userId },
    {
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
    },
    { upsert: true }
  );
  res.json({ profile });
});

export const createProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = CreateProfileSchema.parse(req.body);

  // Check if profile already exists for this user
  const existingProfile = await ProfileModel.findOne({ userId: data.userId });
  if (existingProfile) {
    res.status(409).json({ error: 'Profile already exists for this user' });
    return;
  }

  const profile = await ProfileModel.create(data as any);
  res.status(201).json({ profile });
});