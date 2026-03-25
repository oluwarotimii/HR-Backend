export interface LeaveAllocation {
    id: number;
    user_id: number;
    leave_type_id: number;
    cycle_start_date: Date;
    cycle_end_date: Date;
    allocated_days: number;
    used_days: number;
    carried_over_days: number;
    created_at: Date;
    updated_at: Date;
}
export interface LeaveAllocationInput {
    user_id: number;
    leave_type_id: number;
    cycle_start_date: Date;
    cycle_end_date: Date;
    allocated_days: number;
    used_days?: number;
    carried_over_days?: number;
}
export interface LeaveAllocationUpdate {
    allocated_days?: number;
    used_days?: number;
    carried_over_days?: number;
    cycle_start_date?: Date;
    cycle_end_date?: Date;
}
declare class LeaveAllocationModel {
    static tableName: string;
    static findAll(): Promise<LeaveAllocation[]>;
    static findById(id: number, connection?: any): Promise<LeaveAllocation | null>;
    static findByUserId(userId: number): Promise<LeaveAllocation[]>;
    static findByUserIdAndTypeId(userId: number, leaveTypeId: number, connection?: any): Promise<LeaveAllocation[]>;
    static findByCycleDates(startDate: Date, endDate: Date): Promise<LeaveAllocation[]>;
    static create(allocationData: LeaveAllocationInput, connection?: any): Promise<LeaveAllocation>;
    static update(id: number, allocationData: LeaveAllocationUpdate, connection?: any): Promise<LeaveAllocation | null>;
    static delete(id: number): Promise<boolean>;
    static getRemainingBalance(userId: number, leaveTypeId: number): Promise<number>;
    static updateUsedDays(allocationId: number, daysUsed: number, connection?: any): Promise<boolean>;
    static bulkCreate(allocationsData: {
        user_id: number;
        leave_type_id: number;
        allocated_days: number;
        cycle_start_date: string;
        cycle_end_date: string;
        carried_over_days?: number;
    }[]): Promise<LeaveAllocation[]>;
    static createForAllUsers(leaveTypeId: number, allocatedDays: number, cycleStartDate: string, cycleEndDate: string, carriedOverDays?: number): Promise<{
        success: number;
        failed: number;
        allocations: LeaveAllocation[];
    }>;
}
export default LeaveAllocationModel;
//# sourceMappingURL=leave-allocation.model.d.ts.map