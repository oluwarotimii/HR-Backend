import { Request, Response } from 'express';
export declare const inviteStaffMember: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAvailableRoles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAvailableBranches: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAvailableDepartments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllInvitations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPendingInvitations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resendInvitation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelInvitation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const acceptInvitation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=staff-invitation.controller.d.ts.map