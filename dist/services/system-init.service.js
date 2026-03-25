import { pool } from '../config/database';
import { CacheService } from './cache.service';
export class SystemInitService {
    static CACHE_PREFIX = 'system:';
    static async initialize() {
        console.log('🚀 Starting system initialization...');
        const startTime = Date.now();
        try {
            await Promise.all([
                this.loadRoles(),
                this.loadPermissions(),
                this.loadBranches(),
                this.loadDepartments(),
                this.loadLeaveTypes(),
                this.loadHolidays(),
            ]);
            const duration = Date.now() - startTime;
            console.log(`✅ System initialization completed in ${duration}ms`);
        }
        catch (error) {
            console.error('❌ System initialization failed:', error);
        }
    }
    static async loadRoles() {
        try {
            const [rows] = await pool.execute('SELECT id, name, description, created_at FROM roles ORDER BY id');
            await CacheService.set(`${this.CACHE_PREFIX}roles`, rows, 86400);
            console.log(`   ✓ Loaded ${rows.length} roles`);
        }
        catch (error) {
            console.error('   ✗ Failed to load roles:', error);
        }
    }
    static async loadPermissions() {
        try {
            const [rows] = await pool.execute(`SELECT DISTINCT permission
         FROM roles_permissions
         ORDER BY permission`);
            await CacheService.set(`${this.CACHE_PREFIX}permissions:all`, rows.map((r) => r.permission), 86400);
            console.log(`   ✓ Loaded ${rows.length} permissions`);
        }
        catch (error) {
            console.error('   ✗ Failed to load permissions:', error);
        }
    }
    static async loadBranches() {
        try {
            const [rows] = await pool.execute(`SELECT id, name, code, city, country, phone, email, status 
         FROM branches 
         WHERE status = 'active' 
         ORDER BY name`);
            await CacheService.set(`${this.CACHE_PREFIX}branches`, rows, 86400);
            console.log(`   ✓ Loaded ${rows.length} branches`);
        }
        catch (error) {
            console.error('   ✗ Failed to load branches:', error);
        }
    }
    static async loadDepartments() {
        try {
            const [rows] = await pool.execute(`SELECT id, name, description, branch_id 
         FROM departments 
         ORDER BY name`);
            await CacheService.set(`${this.CACHE_PREFIX}departments`, rows, 86400);
            console.log(`   ✓ Loaded ${rows.length} departments`);
        }
        catch (error) {
            console.error('   ✗ Failed to load departments:', error);
        }
    }
    static async loadLeaveTypes() {
        try {
            const [rows] = await pool.execute(`SELECT id, name, days_per_year, is_paid, is_active 
         FROM leave_types 
         WHERE is_active = TRUE 
         ORDER BY id`);
            await CacheService.set(`${this.CACHE_PREFIX}leave-types`, rows, 86400);
            console.log(`   ✓ Loaded ${rows.length} leave types`);
        }
        catch (error) {
            console.error('   ✗ Failed to load leave types:', error);
        }
    }
    static async loadHolidays() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            const nextYearDate = nextYear.toISOString().split('T')[0];
            const [rows] = await pool.execute(`SELECT id, holiday_name, date, branch_id, is_mandatory, description 
         FROM holidays 
         WHERE date >= ? AND date <= ? 
         ORDER BY date`, [today, nextYearDate]);
            await CacheService.set(`${this.CACHE_PREFIX}holidays:upcoming`, rows, 86400);
            console.log(`   ✓ Loaded ${rows.length} upcoming holidays`);
        }
        catch (error) {
            console.error('   ✗ Failed to load holidays:', error);
        }
    }
    static async getSystemData() {
        const [roles, permissions, branches, departments, leaveTypes, holidays] = await Promise.all([
            CacheService.get(`${this.CACHE_PREFIX}roles`),
            CacheService.get(`${this.CACHE_PREFIX}permissions:all`),
            CacheService.get(`${this.CACHE_PREFIX}branches`),
            CacheService.get(`${this.CACHE_PREFIX}departments`),
            CacheService.get(`${this.CACHE_PREFIX}leave-types`),
            CacheService.get(`${this.CACHE_PREFIX}holidays:upcoming`),
        ]);
        return {
            roles: roles || [],
            permissions: permissions || [],
            branches: branches || [],
            departments: departments || [],
            leaveTypes: leaveTypes || [],
            holidays: holidays || [],
        };
    }
    static async refreshAll() {
        console.log('🔄 Refreshing all system cache...');
        await CacheService.invalidatePattern(`${this.CACHE_PREFIX}*`);
        await this.initialize();
    }
    static async refresh(type) {
        console.log(`🔄 Refreshing ${type} cache...`);
        const refreshMap = {
            roles: () => this.loadRoles(),
            permissions: () => this.loadPermissions(),
            branches: () => this.loadBranches(),
            departments: () => this.loadDepartments(),
            leaveTypes: () => this.loadLeaveTypes(),
            holidays: () => this.loadHolidays(),
        };
        await refreshMap[type]();
    }
    static async getCacheStats() {
        const data = await this.getSystemData();
        return {
            initialized: data.roles.length > 0 || data.branches.length > 0,
            items: {
                roles: data.roles.length,
                permissions: data.permissions.length,
                branches: data.branches.length,
                departments: data.departments.length,
                leaveTypes: data.leaveTypes.length,
                holidays: data.holidays.length,
            }
        };
    }
}
//# sourceMappingURL=system-init.service.js.map