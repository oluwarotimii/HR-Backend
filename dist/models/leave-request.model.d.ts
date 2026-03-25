export interface LeaveRequest {
    id: number;
    user_id: number;
    leave_type_id: number;
    start_date: Date;
    end_date: Date;
    days_requested: number;
    reason: string;
    attachments?: any;
    status: 'submitted' | 'approved' | 'rejected' | 'cancelled';
    reviewed_by?: number;
    reviewed_at?: Date;
    notes?: string;
    cancelled_by?: number | null;
    cancelled_at?: Date | null;
    cancellation_reason?: string | null;
    user_name?: string;
    leave_type_name?: string;
    created_at: Date;
    updated_at: Date;
}
export interface LeaveRequestInput {
    user_id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string;
    attachments?: any;
    status?: 'submitted' | 'approved' | 'rejected' | 'cancelled';
    notes?: string;
}
export interface LeaveRequestUpdate {
    status?: 'submitted' | 'approved' | 'rejected' | 'cancelled';
    reviewed_by?: number;
    reviewed_at?: Date;
    notes?: string;
    cancelled_by?: number;
    cancelled_at?: Date;
    cancellation_reason?: string;
}
declare class LeaveRequestModel {
    static tableName: string;
    static findAll(userId?: number, status?: string, page?: number, limit?: number): Promise<{
        data: LeaveRequest[];
        total: number;
        totalPages: number;
    }>;
    static findById(id: number, connection?: any): Promise<LeaveRequest | null>;
    static findByUserId(userId: number): Promise<LeaveRequest[]>;
    static create(leaveData: LeaveRequestInput, connection?: any): Promise<LeaveRequest>;
    static update(id: number, leaveData: LeaveRequestUpdate, connection?: any): Promise<LeaveRequest | null>;
    static delete(id: number): Promise<boolean>;
}
export default LeaveRequestModel;
//# sourceMappingURL=leave-request.model.d.ts.map