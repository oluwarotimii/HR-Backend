export interface PerformanceScore {
    id?: number;
    employee_id: number;
    kpi_id: number;
    template_id: number;
    score: number;
    achieved_value: number;
    period_start: Date;
    period_end: Date;
    calculated_at: Date;
    calculated_by: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare const PerformanceScoreModel: {
    tableName: string;
    findAll(): Promise<PerformanceScore[]>;
    findById(id: number): Promise<PerformanceScore | null>;
    findByEmployeeId(employeeId: number): Promise<PerformanceScore[]>;
    findByKpiId(kpiId: number): Promise<PerformanceScore[]>;
    findByTemplateId(templateId: number): Promise<PerformanceScore[]>;
    findByPeriod(startDate: Date, endDate: Date): Promise<PerformanceScore[]>;
    findByCategory(category: string): Promise<PerformanceScore[]>;
    create(score: Omit<PerformanceScore, "id" | "calculated_at" | "created_at" | "updated_at">): Promise<PerformanceScore>;
    update(id: number, score: Partial<Omit<PerformanceScore, "id" | "calculated_at" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=performance-score.model.d.ts.map