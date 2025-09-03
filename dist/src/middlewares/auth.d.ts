import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
declare global {
    namespace Express {
        interface Request {
            user?: admin.auth.DecodedIdToken;
        }
    }
}
export declare function maybeApiKey(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
/**
 * Enhanced authentication middleware with token caching and security improvements
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map