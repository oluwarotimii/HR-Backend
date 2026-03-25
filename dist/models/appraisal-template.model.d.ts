export interface AppraisalTemplate {
    id?: number;
    name: string;
    description: string;
    category: string;
    kpi_ids: number[];
    is_active: boolean;
    created_by: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare const AppraisalTemplateModel: {
    tableName: string;
    findAll(): Promise<AppraisalTemplate[]>;
    findById(id: number): Promise<AppraisalTemplate | null>;
    findByCategory(category: string): Promise<AppraisalTemplate[]>;
    create(template: Omit<AppraisalTemplate, "id" | "created_at" | "updated_at">): Promise<AppraisalTemplate>;
    update(id: number, template: Partial<Omit<AppraisalTemplate, "id" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=appraisal-template.model.d.ts.map