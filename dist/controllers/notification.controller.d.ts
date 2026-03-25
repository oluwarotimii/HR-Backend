import { Request, Response } from 'express';
export declare const getUserNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markNotificationAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNotificationPreferences: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateUserNotificationPreferences: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const registerDevice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const unregisterDevice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=notification.controller.d.ts.map