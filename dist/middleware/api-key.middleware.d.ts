import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            apiKey?: any;
            apiKeyUser?: any;
        }
    }
}
export declare const authenticateApiKey: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const checkApiKeyPermission: (requiredPermission: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireApiKey: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=api-key.middleware.d.ts.map