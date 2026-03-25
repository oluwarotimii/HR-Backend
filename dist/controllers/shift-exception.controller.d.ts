import { Request, Response } from 'express';
declare class ShiftExceptionController {
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMyShiftExceptions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const createShiftException: typeof ShiftExceptionController.create, getAllShiftExceptions: typeof ShiftExceptionController.getAll, getMyShiftExceptions: typeof ShiftExceptionController.getMyShiftExceptions, getShiftExceptionById: typeof ShiftExceptionController.getById, updateShiftException: typeof ShiftExceptionController.update, deleteShiftException: typeof ShiftExceptionController.delete;
export default ShiftExceptionController;
//# sourceMappingURL=shift-exception.controller.d.ts.map