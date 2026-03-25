import { Request, Response } from 'express';
export declare const getAllPayrollRecords: (req: Request, res: Response) => Promise<void>;
export declare const getPayrollRecordById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStaffPayrollHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePayrollRecord: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePayrollRecord: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=payroll-record.controller.d.ts.map