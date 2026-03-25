export interface ShiftTiming {
    id: number;
    user_id: number | null;
    shift_name: string;
    start_time: string;
    end_time: string;
    effective_from: Date;
    effective_to: Date | null;
    override_branch_id: number | null;
    created_at: Date;
    updated_at: Date;
}
export interface ShiftTimingInput {
    shift_name: string;
    start_time: string;
    end_time: string;
    effective_from: Date;
    user_id?: number | null;
    effective_to?: Date | null;
    override_branch_id?: number | null;
}
export interface ShiftTimingUpdate {
    shift_name?: string;
    start_time?: string;
    end_time?: string;
    effective_from?: Date;
    effective_to?: Date | null;
    override_branch_id?: number | null;
}
declare class ShiftTimingModel {
    static tableName: string;
    static findAll(): Promise<ShiftTiming[]>;
    static findById(id: number): Promise<ShiftTiming | null>;
    static findByUserId(userId: number): Promise<ShiftTiming[]>;
    static findCurrentShiftForUser(userId: number, date?: Date): Promise<ShiftTiming | null>;
    static findCurrentShiftForBranch(branchId: number, date?: Date): Promise<ShiftTiming[]>;
    static create(shiftData: ShiftTimingInput): Promise<ShiftTiming>;
    static update(id: number, shiftData: ShiftTimingUpdate): Promise<ShiftTiming | null>;
    static delete(id: number): Promise<boolean>;
    static isShiftActive(userId: number, date?: Date): Promise<boolean>;
    static getExpectedTimes(userId: number, date: Date): Promise<{
        startTime: string;
        endTime: string;
    } | null>;
}
export default ShiftTimingModel;
//# sourceMappingURL=shift-timing.model.d.ts.map