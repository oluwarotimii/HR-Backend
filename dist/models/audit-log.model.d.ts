export interface AuditLog {
    id: number;
    user_id?: number;
    action: string;
    entity_type: string;
    entity_id: number;
    before_data?: string;
    after_data?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}
export interface AuditLogInput {
    user_id?: number;
    action: string;
    entity_type: string;
    entity_id: number;
    before_data?: any;
    after_data?: any;
    ip_address?: string;
    user_agent?: string;
}
declare class AuditLogModel {
    static tableName: string;
    static findAll(limit?: number, offset?: number): Promise<AuditLog[]>;
    static findById(id: number): Promise<AuditLog | null>;
    static findByEntity(entityType: string, entityId: number): Promise<AuditLog[]>;
    static findByUser(userId: number): Promise<AuditLog[]>;
    static findByAction(action: string): Promise<AuditLog[]>;
    static create(logData: AuditLogInput): Promise<AuditLog>;
    static logStaffOperation(userId: number, action: string, staffId: number, beforeData?: any, afterData?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog>;
}
export default AuditLogModel;
//# sourceMappingURL=audit-log.model.d.ts.map