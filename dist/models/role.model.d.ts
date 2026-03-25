export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions: string[];
    created_at: Date;
    updated_at: Date;
}
export interface RoleInput {
    name: string;
    description?: string;
    permissions: string[];
}
export interface RoleUpdate {
    name?: string;
    description?: string;
    permissions?: string[];
}
declare class RoleModel {
    static tableName: string;
    static findAll(): Promise<Role[]>;
    static findById(id: number): Promise<Role | null>;
    static findByName(name: string): Promise<Role | null>;
    static create(roleData: RoleInput): Promise<Role>;
    static update(id: number, roleData: RoleUpdate): Promise<Role | null>;
    static delete(id: number): Promise<boolean>;
    static getRolePermissions(roleId: number): Promise<string[]>;
    static findAllWithFilters(limit: number, offset: number, name?: string): Promise<{
        roles: Role[];
        totalCount: number;
    }>;
}
export default RoleModel;
//# sourceMappingURL=role.model.d.ts.map