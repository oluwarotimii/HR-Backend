export interface StaffBranchTimeMapping {
    id: number;
    staff_id: number | null;
    department_id: number | null;
    branch_id: number;
    created_by: number;
    created_at: Date;
    updated_at: Date;
}
export interface StaffBranchTimeMappingInput {
    staff_id?: number | null;
    department_id?: number | null;
    branch_id: number;
    created_by: number;
}
declare class StaffBranchTimeMappingModel {
    static tableName: string;
    static findAll(): Promise<(StaffBranchTimeMapping & {
        staff_name?: string;
        department_name?: string;
        branch_name: string;
    })[]>;
    static findById(id: number): Promise<StaffBranchTimeMapping | null>;
    static findByStaffId(staffId: number): Promise<StaffBranchTimeMapping | null>;
    static findByDepartmentId(departmentId: number): Promise<StaffBranchTimeMapping | null>;
    static findBranchForUser(staffId: number, departmentId: number | null): Promise<number | null>;
    static create(data: StaffBranchTimeMappingInput): Promise<StaffBranchTimeMapping>;
    static delete(id: number): Promise<boolean>;
}
export default StaffBranchTimeMappingModel;
//# sourceMappingURL=staff-branch-time-mapping.model.d.ts.map