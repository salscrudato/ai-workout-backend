import { Request, Response } from 'express';
/**
 * Creates a new user with optional profile data
 *
 * @route POST /v1/users
 * @access Public
 * @param req.body - User creation data (validated against CreateUserSchema)
 * @returns Created user and profile (if provided)
 */
export declare const createUser: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
/**
 * Authenticates a user using Firebase ID token
 *
 * @route POST /v1/auth/authenticate
 * @access Public
 * @param req.body - Authentication data with Firebase ID token
 * @returns User data, profile, and authentication status
 */
export declare const authenticateUser: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
//# sourceMappingURL=user.d.ts.map