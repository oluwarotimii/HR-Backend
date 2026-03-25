import { Request, Response } from 'express';
export declare const getAllForms: (req: Request, res: Response) => Promise<void>;
export declare const getFormById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createForm: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateForm: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteForm: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getFormFields: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=form.controller.d.ts.map