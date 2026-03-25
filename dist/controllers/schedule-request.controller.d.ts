import { Request, Response } from 'express';
export declare const getAllScheduleRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getScheduleRequestById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createScheduleRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateScheduleRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelScheduleRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const approveScheduleRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const rejectScheduleRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTimeOffBankBalance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllTimeOffBanks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createTimeOffBank: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=schedule-request.controller.d.ts.map