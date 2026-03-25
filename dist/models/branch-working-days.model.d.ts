export interface BranchWorkingDay {
    id: number;
    branch_id: number;
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    is_working_day: boolean;
    start_time: string | null;
    end_time: string | null;
    break_duration_minutes: number;
    created_at: Date;
    updated_at: Date;
}
export interface BranchWorkingDayInput {
    branch_id: number;
    day_of_week: string;
    is_working_day?: boolean;
    start_time?: string;
    end_time?: string;
    break_duration_minutes?: number;
}
declare class BranchWorkingDaysModel {
    static tableName: string;
    static findByBranchId(branchId: number): Promise<BranchWorkingDay[]>;
    static findByBranchIdAndDay(branchId: number, dayOfWeek: string): Promise<BranchWorkingDay | null>;
    static isWorkingDay(branchId: number, dayOfWeek: string): Promise<boolean>;
    static getWorkingHours(branchId: number, dayOfWeek: string): Promise<{
        is_working_day: boolean;
        start_time: string | null;
        end_time: string | null;
        break_duration_minutes: number;
    } | null>;
    static upsert(workingDay: BranchWorkingDayInput): Promise<BranchWorkingDay>;
    static bulkUpdate(branchId: number, workingDays: Array<{
        day_of_week: string;
        is_working_day: boolean;
        start_time?: string;
        end_time?: string;
        break_duration_minutes?: number;
    }>): Promise<BranchWorkingDay[]>;
    static findByBranchIds(branchIds: number[]): Promise<BranchWorkingDay[]>;
    static deleteByBranchId(branchId: number): Promise<boolean>;
    static findById(id: number): Promise<BranchWorkingDay | null>;
}
export default BranchWorkingDaysModel;
//# sourceMappingURL=branch-working-days.model.d.ts.map