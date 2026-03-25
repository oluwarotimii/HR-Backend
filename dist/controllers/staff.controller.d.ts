import { Request, Response } from 'express';
export declare const getAllStaff: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStaffById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createStaff: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateStaff: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteStaff: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const terminateStaff: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStaffByDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCurrentUserStaffDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDynamicFields: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createDynamicField: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDynamicField: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteDynamicField: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStaffDynamicValues: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const setStaffDynamicValues: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=staff.controller.d.ts.map