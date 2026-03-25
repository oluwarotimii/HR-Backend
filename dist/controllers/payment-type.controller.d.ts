import { Request, Response } from 'express';
export declare const getAllPaymentTypes: (req: Request, res: Response) => Promise<void>;
export declare const getPaymentTypeById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createPaymentType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePaymentType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePaymentType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const activatePaymentType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=payment-type.controller.d.ts.map