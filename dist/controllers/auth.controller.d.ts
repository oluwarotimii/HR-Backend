import { Request, Response } from 'express';
interface LoginRequestBody {
    email: string;
    password: string;
    rememberMe?: boolean | string;
}
interface RefreshTokenRequestBody {
    refreshToken: string;
}
export declare const login: (req: Request<{}, {}, LoginRequestBody>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request<{}, {}, RefreshTokenRequestBody>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPermissions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=auth.controller.d.ts.map