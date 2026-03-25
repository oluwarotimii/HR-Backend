export interface StaffDocument {
    id: number;
    staff_id: number;
    document_type: string;
    document_name: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
    uploaded_at: Date;
    uploaded_by?: number;
    expiry_date?: Date;
    is_verified: boolean;
    verified_by?: number;
    verified_at?: Date;
}
export interface StaffDocumentInput {
    staff_id: number;
    document_type: string;
    document_name: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
    uploaded_by?: number;
    expiry_date?: Date;
}
export interface StaffDocumentUpdate {
    document_name?: string;
    expiry_date?: Date;
    is_verified?: boolean;
    verified_by?: number;
}
declare class StaffDocumentModel {
    static tableName: string;
    static findAll(staffId?: number): Promise<StaffDocument[]>;
    static findById(id: number): Promise<StaffDocument | null>;
    static findByStaffId(staffId: number): Promise<StaffDocument[]>;
    static findByType(staffId: number, documentType: string): Promise<StaffDocument[]>;
    static create(documentData: StaffDocumentInput): Promise<StaffDocument>;
    static update(id: number, documentData: StaffDocumentUpdate): Promise<StaffDocument | null>;
    static delete(id: number): Promise<boolean>;
    static verifyDocument(id: number, verifiedBy: number): Promise<StaffDocument | null>;
    static getExpiringDocuments(days?: number): Promise<StaffDocument[]>;
}
export default StaffDocumentModel;
//# sourceMappingURL=staff-document.model.d.ts.map