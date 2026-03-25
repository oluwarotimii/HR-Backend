import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            currentUser?: any;
            numericId?: number;
        }
    }
}
export declare const authenticateJWT: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const checkPermission: (permission: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const attachPermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map