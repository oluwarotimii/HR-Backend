export interface Form {
    id: number;
    name: string;
    description?: string;
    form_type: 'leave_request' | 'appraisal' | 'application' | 'feedback' | 'custom';
    branch_id?: number;
    created_by: number;
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
}
export interface FormInput {
    name: string;
    description?: string;
    form_type: 'leave_request' | 'appraisal' | 'application' | 'feedback' | 'custom';
    branch_id?: number;
    created_by: number;
}
export interface FormUpdate {
    name?: string;
    description?: string;
    form_type?: 'leave_request' | 'appraisal' | 'application' | 'feedback' | 'custom';
    branch_id?: number;
    is_active?: boolean;
}
declare class FormModel {
    static tableName: string;
    static findAll(branchId?: number): Promise<Form[]>;
    static findById(id: number): Promise<Form | null>;
    static findByType(formType: string, branchId?: number): Promise<Form[]>;
    static create(formData: FormInput): Promise<Form>;
    static update(id: number, formData: FormUpdate): Promise<Form | null>;
    static delete(id: number): Promise<boolean>;
}
export default FormModel;
//# sourceMappingURL=form.model.d.ts.map