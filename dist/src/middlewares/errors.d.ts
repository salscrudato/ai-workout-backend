import { Request, Response, NextFunction } from 'express';
/**
 * Custom error class for application-specific errors
 * Provides structured error information for better debugging and user experience
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly isOperational: boolean;
    readonly timestamp: string;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean);
}
export declare function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void;
/**
 * Error logging middleware
 */
export declare const errorLoggingMiddleware: (error: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * Async handler wrapper for Express route handlers
 *
 * Automatically catches and forwards async errors to error middleware.
 * Provides type safety for async route handlers.
 *
 * @param fn - Async route handler function
 * @returns Express middleware function that handles async errors
 *
 * @example
 * ```typescript
* export const getUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
 *   const user = await UserModel.findById(req.params.id);
 *   res.json(user);
 * });
 *
```
 */
export declare const asyncHandler: <T extends Request = Request, U extends Response = Response>(fn: (req: T, res: U, next: NextFunction) => Promise<void>) => (req: T, res: U, next: NextFunction) => void;
//# sourceMappingURL=errors.d.ts.map