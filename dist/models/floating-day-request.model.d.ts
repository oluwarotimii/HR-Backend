export interface FloatingDayRequest {
    id: number;
    user_id: number;
    time_off_bank_id: number;
    date: Date;
    reason: string | null;
    status: 'pending' | 'cleared' | 'approved' | 'rejected' | 'cancelled';
    cleared_by: number | null;
    cleared_at: Date | null;
    approved_by: number | null;
    approved_at: Date | null;
    rejected_by: number | null;
    rejected_at: Date | null;
    rejection_reason: string | null;
    created_by: number;
    created_at: Date;
    updated_at: Date;
}
export interface FloatingDayRequestInput {
    user_id: number;
    time_off_bank_id: number;
    date: Date;
    reason?: string | null;
    created_by?: number;
}
declare class FloatingDayRequestModel {
    static tableName: string;
    static findById(id: number): Promise<FloatingDayRequest | null>;
    static findByUserId(userId: number): Promise<any[]>;
    static findAll(status?: string): Promise<any[]>;
    static findPendingForManager(managerUserId: number): Promise<any[]>;
    static create(data: FloatingDayRequestInput): Promise<FloatingDayRequest>;
    static updateStatus(id: number, status: string, extra?: Record<string, any>): Promise<boolean>;
}
export default FloatingDayRequestModel;
//# sourceMappingURL=floating-day-request.model.d.ts.map