import { Request, Response } from 'express';
export declare const getAllPayrollRuns: (req: Request, res: Response) => Promise<void>;
export declare const getPayrollRunById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createPayrollRun: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePayrollRun: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const executePayrollRun: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePayrollRun: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=payroll-run.controller.d.ts.map