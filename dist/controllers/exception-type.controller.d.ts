import { Request, Response } from 'express';
export declare const getAllExceptionTypes: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getExceptionTypeById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createExceptionType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateExceptionType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteExceptionType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleExceptionTypeActive: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=exception-type.controller.d.ts.map