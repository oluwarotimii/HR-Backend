import { Request, Response } from 'express';
export declare const getAllFormSubmissions: (req: Request, res: Response) => Promise<void>;
export declare const getFormSubmissionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const submitForm: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateFormSubmission: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteFormSubmission: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=form-submission.controller.d.ts.map