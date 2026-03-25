import { Request, Response } from 'express';
declare class HolidayDutyRosterController {
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getByHolidayId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getByUserId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static bulkCreate(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default HolidayDutyRosterController;
//# sourceMappingURL=holiday-duty-roster.controller.d.ts.map