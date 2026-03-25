import { Request, Response } from 'express';
export declare const isSystemInitialized: () => Promise<boolean>;
export declare const checkDatabaseSchema: () => Promise<boolean>;
export declare const runMigrations: () => Promise<void>;
export declare const initializeCompleteSystem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const checkSystemReadiness: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=complete-system-init.controller.d.ts.map