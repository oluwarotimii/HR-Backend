export interface Attachment {
    id: number;
    form_submission_id?: number;
    leave_request_id?: number;
    field_id?: number;
    file_name: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
    uploaded_at: Date;
}
export interface AttachmentInput {
    form_submission_id?: number;
    leave_request_id?: number;
    field_id?: number;
    file_name: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
}
export interface AttachmentEntity {
    entityType: 'leave_request' | 'form_submission' | 'staff' | 'appraisal';
    entityId: number;
}
declare class AttachmentService {
    private static tableName;
    static saveAttachments(files: Express.Multer.File[], entity: AttachmentEntity, fieldId?: number): Promise<Attachment[]>;
    static getAttachments(entity: AttachmentEntity): Promise<Attachment[]>;
    static deleteAttachment(attachmentId: number): Promise<boolean>;
    static deleteByEntity(entity: AttachmentEntity): Promise<boolean>;
    static findById(id: number): Promise<Attachment | null>;
    static create(attachmentData: AttachmentInput): Promise<Attachment>;
}
export default AttachmentService;
//# sourceMappingURL=attachment.service.d.ts.map