export interface AppraisalCycle {
    id?: number;
    name: string;
    description: string;
    template_id: number;
    start_date: Date;
    end_date: Date;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    created_by: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare const AppraisalCycleModel: {
    tableName: string;
    findAll(): Promise<AppraisalCycle[]>;
    findById(id: number): Promise<AppraisalCycle | null>;
    findByStatus(status: string): Promise<AppraisalCycle[]>;
    findByTemplateId(templateId: number): Promise<AppraisalCycle[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<AppraisalCycle[]>;
    create(cycle: Omit<AppraisalCycle, "id" | "created_at" | "updated_at">): Promise<AppraisalCycle>;
    update(id: number, cycle: Partial<Omit<AppraisalCycle, "id" | "created_at" | "updated_at">>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=appraisal-cycle.model.d.ts.map