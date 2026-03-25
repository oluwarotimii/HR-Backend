import { Request, Response } from 'express';
export declare const updateApplicationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllApplications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const withdrawApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addCommentToApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCommentsForApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=application-management.controller.d.ts.map