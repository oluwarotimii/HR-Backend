export interface FormAttachment {
    id: number;
    form_submission_id: number;
    field_id: number;
    file_name: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
    uploaded_at: Date;
}
export interface FormAttachmentInput {
    form_submission_id: number;
    field_id: number;
    file_name: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
}
declare class FormAttachmentModel {
    static tableName: string;
    static findAll(submissionId?: number): Promise<FormAttachment[]>;
    static findById(id: number): Promise<FormAttachment | null>;
    static findBySubmissionId(submissionId: number): Promise<FormAttachment[]>;
    static findByFieldId(fieldId: number): Promise<FormAttachment[]>;
    static create(attachmentData: FormAttachmentInput): Promise<FormAttachment>;
    static delete(id: number): Promise<boolean>;
    static deleteBySubmissionId(submissionId: number): Promise<boolean>;
}
export default FormAttachmentModel;
//# sourceMappingURL=form-attachment.model.d.ts.map