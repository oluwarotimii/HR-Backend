export interface RolePermission {
    id: number;
    role_id: number;
    permission: string;
    allow_deny: 'allow' | 'deny';
    created_at: Date;
}
export interface RolePermissionInput {
    role_id: number;
    permission: string;
    allow_deny?: 'allow' | 'deny';
}
declare class RolePermissionModel {
    static tableName: string;
    static findAll(): Promise<RolePermission[]>;
    static findById(id: number): Promise<RolePermission | null>;
    static findByRoleId(roleId: number): Promise<RolePermission[]>;
    static findByRoleAndPermission(roleId: number, permission: string): Promise<RolePermission | null>;
    static create(permissionData: RolePermissionInput): Promise<RolePermission>;
    static delete(id: number): Promise<boolean>;
    static deleteRolePermission(roleId: number, permission: string): Promise<boolean>;
    static deleteMultipleRolePermissions(roleId: number, permissions: string[]): Promise<boolean>;
    static getRolePermissions(roleId: number): Promise<RolePermission[]>;
    static hasPermission(roleId: number, permission: string): Promise<boolean>;
}
export default RolePermissionModel;
//# sourceMappingURL=role-permission.model.d.ts.map