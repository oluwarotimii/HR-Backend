import { Request, Response } from 'express';
export declare const getAllRoles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRoleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRolePermissions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addRolePermission: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeRolePermission: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=role.controller.d.ts.map