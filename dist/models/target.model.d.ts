export interface Target {
    id?: number;
    kpi_id: number;
    employee_id: number;
    department_id?: number;
    template_id?: number;
    target_type: 'minimum' | 'standard' | 'stretch';
    target_value: number;
    period_start: Date;
    period_end: Date;
    created_by: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare const TargetModel: {
    tableName: string;
    findAll(): Promise<Target[]>;
    findById(id: number): Promise<Target | null>;
    findByEmployeeId(employeeId: number): Promise<Target[]>;
    findByKpiId(kpiId: number): Promise<Target[]>;
    findByTemplateId(templateId: number): Promise<Target[]>;
    findByCategory(category: string): Promise<Target[]>;
    create(target: Omit<Target, "id" | "created_at" | "updated_at">): Promise<Target>;
    update(id: number, target: Partial<Omit<Target, "id" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=target.model.d.ts.map