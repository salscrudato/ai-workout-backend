import { Request, Response, NextFunction } from 'express';
export declare function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void;
export declare const asyncHandler: <T extends Request, U extends Response>(fn: (req: T, res: U, next: NextFunction) => Promise<void>) => (req: T, res: U, next: NextFunction) => void;
//# sourceMappingURL=errors.d.ts.map