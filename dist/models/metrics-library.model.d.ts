export interface MetricsLibrary {
    id?: number;
    name: string;
    description: string;
    data_type: 'numeric' | 'percentage' | 'boolean' | 'rating';
    formula: string;
    data_source: string;
    categories: string[];
    is_active: boolean;
    created_by: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare const MetricsLibraryModel: {
    tableName: string;
    findAll(): Promise<MetricsLibrary[]>;
    findById(id: number): Promise<MetricsLibrary | null>;
    findByCategory(category: string): Promise<MetricsLibrary[]>;
    create(metric: Omit<MetricsLibrary, "id" | "created_at" | "updated_at">): Promise<MetricsLibrary>;
    update(id: number, metric: Partial<Omit<MetricsLibrary, "id" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=metrics-library.model.d.ts.map