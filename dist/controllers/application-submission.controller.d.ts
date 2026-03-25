import { Request, Response } from 'express';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare const submitJobApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getApplicationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getApplicationsByJobPosting: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getApplicationsByApplicant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=application-submission.controller.d.ts.map