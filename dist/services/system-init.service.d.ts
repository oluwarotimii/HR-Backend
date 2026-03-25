export declare class SystemInitService {
    private static readonly CACHE_PREFIX;
    static initialize(): Promise<void>;
    private static loadRoles;
    private static loadPermissions;
    private static loadBranches;
    private static loadDepartments;
    private static loadLeaveTypes;
    private static loadHolidays;
    static getSystemData(): Promise<{
        roles: any[];
        permissions: any[];
        branches: any[];
        departments: any[];
        leaveTypes: any[];
        holidays: any[];
    }>;
    static refreshAll(): Promise<void>;
    static refresh(type: 'roles' | 'permissions' | 'branches' | 'departments' | 'leaveTypes' | 'holidays'): Promise<void>;
    static getCacheStats(): Promise<{
        initialized: boolean;
        lastLoaded?: string;
        items: {
            roles?: number;
            permissions?: number;
            branches?: number;
            departments?: number;
            leaveTypes?: number;
            holidays?: number;
        };
    }>;
}
//# sourceMappingURL=system-init.service.d.ts.map