export interface AppraisalAssignment {
    id?: number;
    employee_id: number;
    appraisal_cycle_id: number;
    status: 'pending' | 'in_progress' | 'submitted' | 'reviewed' | 'completed';
    assigned_by: number;
    assigned_at: Date;
    completed_at?: Date;
    created_at?: Date;
    updated_at?: Date;
}
export declare const AppraisalAssignmentModel: {
    tableName: string;
    findAll(): Promise<AppraisalAssignment[]>;
    findById(id: number): Promise<AppraisalAssignment | null>;
    findByEmployeeId(employeeId: number): Promise<AppraisalAssignment[]>;
    findByAppraisalCycleId(cycleId: number): Promise<AppraisalAssignment[]>;
    findByStatus(status: string): Promise<AppraisalAssignment[]>;
    create(assignment: Omit<AppraisalAssignment, "id" | "assigned_at" | "created_at" | "updated_at">): Promise<AppraisalAssignment>;
    update(id: number, assignment: Partial<Omit<AppraisalAssignment, "id" | "assigned_at" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=appraisal-assignment.model.d.ts.map