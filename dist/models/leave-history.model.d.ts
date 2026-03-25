export interface LeaveHistory {
    id: number;
    user_id: number;
    leave_type_id: number;
    start_date: Date;
    end_date: Date;
    days_taken: number;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_at: Date | null;
    created_at: Date;
}
export interface LeaveHistoryInput {
    user_id: number;
    leave_type_id: number;
    start_date: Date;
    end_date: Date;
    days_taken: number;
    reason?: string | null;
    approved_at?: Date | null;
}
export interface LeaveHistoryUpdate {
    approved_at?: Date | null;
    reason?: string | null;
}
declare class LeaveHistoryModel {
    static tableName: string;
    static findAll(): Promise<LeaveHistory[]>;
    static findById(id: number): Promise<LeaveHistory | null>;
    static findByUserId(userId: number): Promise<LeaveHistory[]>;
    static findByUserIdAndDateRange(userId: number, startDate: Date, endDate: Date): Promise<LeaveHistory[]>;
    static findByLeaveType(leaveTypeId: number): Promise<LeaveHistory[]>;
    static create(historyData: LeaveHistoryInput): Promise<LeaveHistory>;
    static update(id: number, historyData: LeaveHistoryUpdate): Promise<LeaveHistory | null>;
    static delete(id: number): Promise<boolean>;
    static getTotalDaysTaken(userId: number, leaveTypeId: number, startDate: Date, endDate: Date): Promise<number>;
    static hasOverlappingLeave(userId: number, startDate: Date, endDate: Date): Promise<boolean>;
}
export default LeaveHistoryModel;
//# sourceMappingURL=leave-history.model.d.ts.map