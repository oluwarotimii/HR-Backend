export interface UserPermission {
    id: number;
    user_id: number;
    permission: string;
    allow_deny: 'allow' | 'deny';
    created_at: Date;
    updated_at: Date;
}
export interface UserPermissionInput {
    user_id: number;
    permission: string;
    allow_deny?: 'allow' | 'deny';
}
export interface UserPermissionUpdate {
    allow_deny?: 'allow' | 'deny';
}
declare class UserPermissionModel {
    static tableName: string;
    static findAll(): Promise<UserPermission[]>;
    static findById(id: number): Promise<UserPermission | null>;
    static findByUserId(userId: number): Promise<UserPermission[]>;
    static findByUserAndPermission(userId: number, permission: string): Promise<UserPermission | null>;
    static create(permissionData: UserPermissionInput): Promise<UserPermission>;
    static update(id: number, permissionData: UserPermissionUpdate): Promise<UserPermission | null>;
    static delete(id: number): Promise<boolean>;
    static deleteUserPermission(userId: number, permission: string): Promise<boolean>;
    static getUserPermissions(userId: number): Promise<UserPermission[]>;
    static hasPermission(userId: number, permission: string): Promise<boolean>;
}
export default UserPermissionModel;
//# sourceMappingURL=user-permission.model.d.ts.map