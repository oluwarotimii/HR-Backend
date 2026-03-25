export interface KpiScore {
    id?: number;
    kpi_assignment_id: number;
    calculated_value: number;
    achievement_percentage: number;
    weighted_score: number;
    calculated_at: Date;
    manually_overridden?: boolean;
    override_value?: number;
    override_reason?: string;
    override_by?: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare const KpiScoreModel: {
    tableName: string;
    findAll(): Promise<KpiScore[]>;
    findById(id: number): Promise<KpiScore | null>;
    findByAssignmentId(assignmentId: number): Promise<KpiScore[]>;
    findByUserId(userId: number): Promise<KpiScore[]>;
    create(score: Omit<KpiScore, "id" | "calculated_at" | "created_at" | "updated_at">): Promise<KpiScore>;
    update(id: number, score: Partial<Omit<KpiScore, "id" | "calculated_at" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=kpi-score.model.d.ts.map