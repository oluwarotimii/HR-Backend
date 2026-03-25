export interface KpiAssignment {
    id?: number;
    user_id: number;
    kpi_definition_id: number;
    cycle_start_date: Date;
    cycle_end_date: Date;
    assigned_by: number;
    custom_target_value?: number;
    notes?: string;
    created_at?: Date;
    updated_at?: Date;
}
export declare const KpiAssignmentModel: {
    tableName: string;
    findAll(): Promise<KpiAssignment[]>;
    findById(id: number): Promise<KpiAssignment | null>;
    findByUserId(userId: number): Promise<KpiAssignment[]>;
    findByKpiDefinitionId(kpiDefinitionId: number): Promise<KpiAssignment[]>;
    create(assignment: Omit<KpiAssignment, "id" | "created_at" | "updated_at">): Promise<KpiAssignment>;
    update(id: number, assignment: Partial<Omit<KpiAssignment, "id" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=kpi-assignment.model.d.ts.map