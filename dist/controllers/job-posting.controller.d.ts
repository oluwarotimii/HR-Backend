import { Request, Response } from 'express';
export declare const getAllJobPostings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getJobPostingById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createJobPosting: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateJobPosting: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const closeJobPosting: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteJobPosting: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=job-posting.controller.d.ts.map