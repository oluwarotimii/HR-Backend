export interface HolidayDutyRoster {
    id: number;
    holiday_id: number;
    user_id: number;
    shift_start_time: string;
    shift_end_time: string;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface HolidayDutyRosterInput {
    holiday_id: number;
    user_id: number;
    shift_start_time: string;
    shift_end_time: string;
    notes?: string | null;
}
export interface HolidayDutyRosterUpdate {
    shift_start_time?: string;
    shift_end_time?: string;
    notes?: string | null;
}
declare class HolidayDutyRosterModel {
    static tableName: string;
    static findAll(): Promise<HolidayDutyRoster[]>;
    static findById(id: number): Promise<HolidayDutyRoster | null>;
    static findByHolidayId(holidayId: number): Promise<HolidayDutyRoster[]>;
    static findByUserId(userId: number): Promise<HolidayDutyRoster[]>;
    static findByHolidayAndUser(holidayId: number, userId: number): Promise<HolidayDutyRoster | null>;
    static create(rosterData: HolidayDutyRosterInput): Promise<HolidayDutyRoster>;
    static bulkCreate(rosterDataArray: HolidayDutyRosterInput[]): Promise<HolidayDutyRoster[]>;
    static update(id: number, rosterData: HolidayDutyRosterUpdate): Promise<HolidayDutyRoster | null>;
    static delete(id: number): Promise<boolean>;
    static deleteByHolidayId(holidayId: number): Promise<number>;
}
export default HolidayDutyRosterModel;
//# sourceMappingURL=holiday-duty-roster.model.d.ts.map