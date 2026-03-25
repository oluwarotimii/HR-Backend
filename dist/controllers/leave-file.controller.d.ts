import { Request, Response } from 'express';
export interface UploadedFile {
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
}
export declare const uploadLeaveFiles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLeaveRequestFiles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteLeaveRequestFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const serveLeaveFile: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=leave-file.controller.d.ts.map