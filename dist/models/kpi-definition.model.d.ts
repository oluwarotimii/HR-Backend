export interface KpiDefinition {
    id?: number;
    name: string;
    description: string;
    formula: string;
    weight: number;
    metric_ids: number[];
    categories: string[];
    is_active: boolean;
    created_by: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare const KpiDefinitionModel: {
    tableName: string;
    findAll(): Promise<KpiDefinition[]>;
    findById(id: number): Promise<KpiDefinition | null>;
    findByCategory(category: string): Promise<KpiDefinition[]>;
    create(kpi: Omit<KpiDefinition, "id" | "created_at" | "updated_at">): Promise<KpiDefinition>;
    update(id: number, kpi: Partial<Omit<KpiDefinition, "id" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=kpi-definition.model.d.ts.map