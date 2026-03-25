export interface Holiday {
    id: number;
    holiday_name: string;
    date: Date;
    branch_id: number | null;
    is_mandatory: boolean;
    description: string | null;
    created_by: number | null;
    created_at: Date;
}
export interface HolidayInput {
    holiday_name: string;
    date: Date;
    branch_id?: number | null;
    is_mandatory?: boolean;
    description?: string | null;
    created_by?: number | null;
}
export interface HolidayUpdate {
    holiday_name?: string;
    date?: Date;
    branch_id?: number | null;
    is_mandatory?: boolean;
    description?: string | null;
}
declare class HolidayModel {
    static tableName: string;
    static findAll(): Promise<Holiday[]>;
    static findById(id: number): Promise<Holiday | null>;
    static findByDate(date: Date): Promise<Holiday[]>;
    static findByBranch(branchId: number): Promise<Holiday[]>;
    static isHoliday(date: Date, branchId?: number | null): Promise<boolean>;
    static getHolidaysInRange(startDate: Date, endDate: Date, branchId?: number | null): Promise<Holiday[]>;
    static create(holidayData: HolidayInput): Promise<Holiday>;
    static update(id: number, holidayData: HolidayUpdate): Promise<Holiday | null>;
    static delete(id: number): Promise<boolean>;
}
export default HolidayModel;
//# sourceMappingURL=holiday.model.d.ts.map