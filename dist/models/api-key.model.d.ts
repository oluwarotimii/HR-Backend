export interface ApiKey {
    id: number;
    key: string;
    name: string;
    user_id: number;
    permissions: string[] | string;
    is_active: boolean;
    expires_at?: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface ApiKeyInput {
    name: string;
    user_id: number;
    permissions: string[];
    expires_at?: Date | null;
}
export interface ApiKeyUpdate {
    name?: string;
    permissions?: string[];
    is_active?: boolean;
    expires_at?: Date | null;
}
declare class ApiKeyModel {
    static tableName: string;
    static create(apiKeyData: ApiKeyInput): Promise<{
        apiKey: ApiKey;
        plainTextKey: string;
    }>;
    static findById(id: number): Promise<ApiKey | null>;
    static findByKey(plainTextKey: string): Promise<ApiKey | null>;
    static findByUser(userId: number): Promise<ApiKey[]>;
    static update(id: number, updateData: ApiKeyUpdate): Promise<ApiKey | null>;
    static delete(id: number): Promise<boolean>;
    static hasPermission(apiKeyId: number, permission: string): Promise<boolean>;
}
export default ApiKeyModel;
//# sourceMappingURL=api-key.model.d.ts.map