import { Request, Response, NextFunction } from 'express';
export declare const checkPermission: (permission: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const attachPermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=permission.middleware.d.ts.map