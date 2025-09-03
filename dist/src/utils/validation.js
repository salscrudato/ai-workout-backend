"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteWorkoutSchema = exports.GenerateWorkoutSchema = exports.WorkoutTypeSchema = exports.CreateProfileSchema = exports.ObjectIdSchema = exports.isValidObjectId = exports.ConstraintsSchema = exports.EquipmentSchema = exports.GoalsSchema = exports.SexSchema = exports.ExperienceSchema = exports.CreateUserSchema = exports.UrlSchema = exports.PhoneSchema = exports.PasswordSchema = exports.EmailSchema = exports.SafeStringSchema = exports.validateEmail = exports.sanitizeHtml = exports.sanitizeString = void 0;
const zod_1 = require("zod");
/**
 * Enhanced validation utilities with comprehensive input sanitization and validation
 */
// Common validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
// Sanitization functions
const sanitizeString = (str) => {
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove potential XSS characters
        .replace(/\s+/g, ' '); // Normalize whitespace
};
exports.sanitizeString = sanitizeString;
const sanitizeHtml = (str) => {
    return str
        .replace(/[<>'"&]/g, (match) => {
        const htmlEntities = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;',
        };
        return htmlEntities[match] || match;
    });
};
exports.sanitizeHtml = sanitizeHtml;
// Legacy function for backward compatibility
const validateEmail = (email) => {
    return EMAIL_REGEX.test(email);
};
exports.validateEmail = validateEmail;
// Enhanced base schemas
exports.SafeStringSchema = zod_1.z
    .string()
    .min(1, 'Field is required')
    .max(1000, 'Field is too long')
    .transform(exports.sanitizeString);
exports.EmailSchema = zod_1.z
    .string()
    .email('Invalid email format')
    .regex(EMAIL_REGEX, 'Invalid email format')
    .max(254, 'Email is too long')
    .transform((email) => email.toLowerCase().trim());
exports.PasswordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
exports.PhoneSchema = zod_1.z
    .string()
    .regex(PHONE_REGEX, 'Invalid phone number format')
    .optional();
exports.UrlSchema = zod_1.z
    .string()
    .regex(URL_REGEX, 'Invalid URL format')
    .optional();
// User validation schemas
exports.CreateUserSchema = zod_1.z.object({
    email: exports.EmailSchema.optional(),
    firebaseUid: zod_1.z.string().min(1, 'Firebase UID is required').optional(),
});
// Profile validation schemas
exports.ExperienceSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Experience must be beginner, intermediate, or advanced' }),
});
exports.SexSchema = zod_1.z.enum(['male', 'female', 'prefer_not_to_say'], {
    errorMap: () => ({ message: 'Sex must be male, female, or prefer_not_to_say' }),
});
exports.GoalsSchema = zod_1.z
    .array(zod_1.z.string().min(1, 'Goal cannot be empty').max(100, 'Goal is too long'))
    .min(1, 'At least one goal is required')
    .max(10, 'Too many goals selected')
    .transform((goals) => goals.map(exports.sanitizeString));
exports.EquipmentSchema = zod_1.z
    .array(zod_1.z.string().min(1, 'Equipment name cannot be empty').max(50, 'Equipment name is too long'))
    .max(50, 'Too many equipment items selected')
    .transform((equipment) => equipment.map(exports.sanitizeString));
exports.ConstraintsSchema = zod_1.z
    .array(zod_1.z.string().max(200, 'Constraint is too long'))
    .max(20, 'Too many constraints')
    .transform((constraints) => constraints.map(exports.sanitizeString));
// Utility function to validate ObjectId format
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id) || /^[0-9a-zA-Z]{20,}$/.test(id); // Support both MongoDB ObjectId and Firestore document ID formats
};
exports.isValidObjectId = isValidObjectId;
exports.ObjectIdSchema = zod_1.z
    .string()
    .min(1, 'ID is required')
    .refine(exports.isValidObjectId, 'Invalid ID format');
exports.CreateProfileSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    experience: exports.ExperienceSchema,
    goals: exports.GoalsSchema,
    equipmentAvailable: exports.EquipmentSchema,
    age: zod_1.z
        .number()
        .int('Age must be a whole number')
        .min(13, 'Must be at least 13 years old')
        .max(120, 'Age must be realistic')
        .optional(),
    sex: exports.SexSchema,
    height_ft: zod_1.z
        .number()
        .int('Height (feet) must be a whole number')
        .min(3, 'Height must be realistic')
        .max(8, 'Height must be realistic')
        .optional(),
    height_in: zod_1.z
        .number()
        .int('Height (inches) must be a whole number')
        .min(0, 'Inches cannot be negative')
        .max(11, 'Inches must be less than 12')
        .optional(),
    weight_lb: zod_1.z
        .number()
        .positive('Weight must be positive')
        .min(50, 'Weight must be realistic')
        .max(1000, 'Weight must be realistic')
        .optional(),
    injury_notes: zod_1.z
        .string()
        .max(1000, 'Injury notes are too long')
        .transform(exports.sanitizeHtml)
        .optional(),
    constraints: exports.ConstraintsSchema,
    health_ack: zod_1.z.boolean(),
    data_consent: zod_1.z.boolean(),
});
// Workout validation schemas
exports.WorkoutTypeSchema = zod_1.z.enum([
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
exports.GenerateWorkoutSchema = zod_1.z.object({
    experience: exports.ExperienceSchema,
    goals: exports.GoalsSchema,
    workoutType: zod_1.z.string().min(1, 'Workout type is required').max(50, 'Workout type is too long'),
    equipmentAvailable: exports.EquipmentSchema,
    duration: zod_1.z
        .number()
        .int('Duration must be a whole number')
        .min(10, 'Minimum workout duration is 10 minutes')
        .max(180, 'Maximum workout duration is 180 minutes'),
    constraints: exports.ConstraintsSchema.optional().default([]),
});
exports.CompleteWorkoutSchema = zod_1.z.object({
    feedback: zod_1.z
        .string()
        .max(2000, 'Feedback is too long')
        .transform(exports.sanitizeHtml)
        .optional(),
    rating: zod_1.z
        .number()
        .int('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5')
        .optional(),
    startedAt: zod_1.z.string().datetime('Invalid start time format').optional(),
    completedAt: zod_1.z.string().datetime('Invalid completion time format').optional(),
});
//# sourceMappingURL=validation.js.map