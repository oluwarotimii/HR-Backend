import { Request, Response } from 'express';
export interface UploadedDocument {
    id: number;
    staff_id: number;
    document_type: string;
    document_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    uploaded_by: number;
    uploaded_at: string;
}
export declare const uploadStaffDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStaffDocuments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStaffDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteStaffDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const serveStaffDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=staff-document.controller.d.ts.map