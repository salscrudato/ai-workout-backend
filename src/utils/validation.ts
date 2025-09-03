import { z } from 'zod';

/**
 * Enhanced validation utilities with comprehensive input sanitization and validation
 */

// Common validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Sanitization functions
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

export const sanitizeHtml = (str: string): string => {
  return str
    .replace(/[<>'"&]/g, (match) => {
      const htmlEntities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return htmlEntities[match] || match;
    });
};

// Legacy function for backward compatibility
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

// Enhanced base schemas
export const SafeStringSchema = z
  .string()
  .min(1, 'Field is required')
  .max(1000, 'Field is too long')
  .transform(sanitizeString);

export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .regex(EMAIL_REGEX, 'Invalid email format')
  .max(254, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const PhoneSchema = z
  .string()
  .regex(PHONE_REGEX, 'Invalid phone number format')
  .optional();

export const UrlSchema = z
  .string()
  .regex(URL_REGEX, 'Invalid URL format')
  .optional();

// User validation schemas
export const CreateUserSchema = z.object({
  email: EmailSchema.optional(),
  firebaseUid: z.string().min(1, 'Firebase UID is required').optional(),
});

// Profile validation schemas
export const ExperienceSchema = z.enum(['beginner', 'intermediate', 'advanced'], {
  errorMap: () => ({ message: 'Experience must be beginner, intermediate, or advanced' }),
});

export const SexSchema = z.enum(['male', 'female', 'prefer_not_to_say'], {
  errorMap: () => ({ message: 'Sex must be male, female, or prefer_not_to_say' }),
});

export const GoalsSchema = z
  .array(z.string().min(1, 'Goal cannot be empty').max(100, 'Goal is too long'))
  .min(1, 'At least one goal is required')
  .max(10, 'Too many goals selected')
  .transform((goals) => goals.map(sanitizeString));

export const EquipmentSchema = z
  .array(z.string().min(1, 'Equipment name cannot be empty').max(50, 'Equipment name is too long'))
  .max(50, 'Too many equipment items selected')
  .transform((equipment) => equipment.map(sanitizeString));

export const ConstraintsSchema = z
  .array(z.string().max(200, 'Constraint is too long'))
  .max(20, 'Too many constraints')
  .transform((constraints) => constraints.map(sanitizeString));

// Utility function to validate ObjectId format
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id) || /^[0-9a-zA-Z]{20,}$/.test(id); // Support both MongoDB ObjectId and Firestore document ID formats
};

export const ObjectIdSchema = z
  .string()
  .min(1, 'ID is required')
  .refine(isValidObjectId, 'Invalid ID format');

export const CreateProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  experience: ExperienceSchema,
  goals: GoalsSchema,
  equipmentAvailable: EquipmentSchema,
  age: z
    .number()
    .int('Age must be a whole number')
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Age must be realistic')
    .optional(),
  sex: SexSchema,
  height_ft: z
    .number()
    .int('Height (feet) must be a whole number')
    .min(3, 'Height must be realistic')
    .max(8, 'Height must be realistic')
    .optional(),
  height_in: z
    .number()
    .int('Height (inches) must be a whole number')
    .min(0, 'Inches cannot be negative')
    .max(11, 'Inches must be less than 12')
    .optional(),
  weight_lb: z
    .number()
    .positive('Weight must be positive')
    .min(50, 'Weight must be realistic')
    .max(1000, 'Weight must be realistic')
    .optional(),
  injury_notes: z
    .string()
    .max(1000, 'Injury notes are too long')
    .transform(sanitizeHtml)
    .optional(),
  constraints: ConstraintsSchema,
  health_ack: z.boolean(),
  data_consent: z.boolean(),
});

// Workout validation schemas
export const WorkoutTypeSchema = z.enum([
  'full_body',
  'upper_lower',
  'push',
  'pull',
  'legs',
  'core',
  'conditioning',
  'mobility',
  'recovery'
], {
  errorMap: () => ({ message: 'Invalid workout type' }),
});

export const GenerateWorkoutSchema = z.object({
  experience: ExperienceSchema,
  goals: GoalsSchema,
  workoutType: z.string().min(1, 'Workout type is required').max(50, 'Workout type is too long'),
  equipmentAvailable: EquipmentSchema,
  duration: z
    .number()
    .int('Duration must be a whole number')
    .min(10, 'Minimum workout duration is 10 minutes')
    .max(180, 'Maximum workout duration is 180 minutes'),
  constraints: ConstraintsSchema.optional().default([]),
});

export const CompleteWorkoutSchema = z.object({
  feedback: z
    .string()
    .max(2000, 'Feedback is too long')
    .transform(sanitizeHtml)
    .optional(),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  startedAt: z.string().datetime('Invalid start time format').optional(),
  completedAt: z.string().datetime('Invalid completion time format').optional(),
});

// Type exports
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutSchema>;
export type CompleteWorkoutInput = z.infer<typeof CompleteWorkoutSchema>;
