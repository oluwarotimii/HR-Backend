import { Request, Response } from 'express';
export interface Department {
    id: number;
    name: string;
    description: string;
    branch_id: number | null;
    created_at: Date;
    updated_at: Date;
}
export declare const getAllDepartments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDepartmentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=department-management.controller.d.ts.map