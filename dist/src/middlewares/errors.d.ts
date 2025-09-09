import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly isOperational: boolean;
    readonly timestamp: string;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean);
}
export declare function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void;
export declare const errorLoggingMiddleware: (error: Error, req: Request, _res: Response, next: NextFunction) => void;
export declare const asyncHandler: <T extends Request = Request, U extends Response = Response>(fn: (req: T, res: U, next: NextFunction) => Promise<void>) => (req: T, res: U, next: NextFunction) => void;
//# sourceMappingURL=errors.d.ts.map