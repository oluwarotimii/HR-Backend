import { Request, Response } from 'express';
export declare const isSystemInitialized: () => Promise<boolean>;
export declare const initializeSystem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const checkInitializationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=system-init.controller.d.ts.map