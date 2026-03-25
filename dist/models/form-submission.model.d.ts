export interface FormSubmission {
    id: number;
    form_id: number;
    user_id: number;
    submission_data: any;
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    submitted_at: Date;
    reviewed_by?: number;
    reviewed_at?: Date;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}
export interface FormSubmissionInput {
    form_id: number;
    user_id: number;
    submission_data: any;
    status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    notes?: string;
}
export interface FormSubmissionUpdate {
    status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    reviewed_by?: number;
    reviewed_at?: Date;
    notes?: string;
}
declare class FormSubmissionModel {
    static tableName: string;
    static findAll(formId?: number, userId?: number, status?: string): Promise<FormSubmission[]>;
    static findById(id: number): Promise<FormSubmission | null>;
    static findByFormId(formId: number): Promise<FormSubmission[]>;
    static findByUserId(userId: number): Promise<FormSubmission[]>;
    static findByStatus(status: string): Promise<FormSubmission[]>;
    static create(submissionData: FormSubmissionInput): Promise<FormSubmission>;
    static update(id: number, submissionData: FormSubmissionUpdate): Promise<FormSubmission | null>;
    static delete(id: number): Promise<boolean>;
}
export default FormSubmissionModel;
//# sourceMappingURL=form-submission.model.d.ts.map