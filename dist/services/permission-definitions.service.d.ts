export interface PermissionDefinition {
    key: string;
    category: string;
    description: string;
}
export declare const PERMISSION_DEFINITIONS: PermissionDefinition[];
export declare const getPermissionsByCategory: (category: string) => PermissionDefinition[];
export declare const getAllPermissionCategories: () => string[];
export declare const isValidPermission: (permission: string) => boolean;
export declare const getPermissionByKey: (key: string) => PermissionDefinition | undefined;
//# sourceMappingURL=permission-definitions.service.d.ts.map