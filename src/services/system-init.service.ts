import { pool } from '../config/database';
import { CacheService } from './cache.service';

/**
 * System Initialization Service
 * 
 * Pre-loads static/frequently-accessed data into Redis cache on application startup.
 * This significantly improves page load times by avoiding repeated database queries
 * for data that rarely changes.
 */
export class SystemInitService {
  private static readonly CACHE_PREFIX = 'system:';
  
  /**
   * Initialize all system data
   * Called once on application startup
   */
  static async initialize(): Promise<void> {
    console.log('🚀 Starting system initialization...');
    
    const startTime = Date.now();
    
    try {
      // Load all static data in parallel
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
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      // Don't throw - allow app to continue even if cache warming fails
    }
  }

  /**
   * Load all roles into cache
   */
  private static async loadRoles(): Promise<void> {
    try {
      const [rows]: any = await pool.execute(
        'SELECT id, name, description, created_at FROM roles ORDER BY id'
      );
      
      await CacheService.set(`${this.CACHE_PREFIX}roles`, rows, 86400); // 24 hours
      console.log(`   ✓ Loaded ${rows.length} roles`);
    } catch (error) {
      console.error('   ✗ Failed to load roles:', error);
    }
  }

  /**
   * Load all permissions into cache
   */
  private static async loadPermissions(): Promise<void> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT DISTINCT permission
         FROM roles_permissions
         ORDER BY permission`
      );

      await CacheService.set(`${this.CACHE_PREFIX}permissions:all`, rows.map((r: any) => r.permission), 86400);
      console.log(`   ✓ Loaded ${rows.length} permissions`);
    } catch (error) {
      console.error('   ✗ Failed to load permissions:', error);
    }
  }

  /**
   * Load all branches into cache
   */
  private static async loadBranches(): Promise<void> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, name, code, city, country, phone, email, status 
         FROM branches 
         WHERE status = 'active' 
         ORDER BY name`
      );
      
      await CacheService.set(`${this.CACHE_PREFIX}branches`, rows, 86400);
      console.log(`   ✓ Loaded ${rows.length} branches`);
    } catch (error) {
      console.error('   ✗ Failed to load branches:', error);
    }
  }

  /**
   * Load all departments into cache
   */
  private static async loadDepartments(): Promise<void> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, name, description, branch_id 
         FROM departments 
         ORDER BY name`
      );
      
      await CacheService.set(`${this.CACHE_PREFIX}departments`, rows, 86400);
      console.log(`   ✓ Loaded ${rows.length} departments`);
    } catch (error) {
      console.error('   ✗ Failed to load departments:', error);
    }
  }

  /**
   * Load all active leave types into cache
   */
  private static async loadLeaveTypes(): Promise<void> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, name, days_per_year, is_paid, is_active 
         FROM leave_types 
         WHERE is_active = TRUE 
         ORDER BY id`
      );
      
      await CacheService.set(`${this.CACHE_PREFIX}leave-types`, rows, 86400);
      console.log(`   ✓ Loaded ${rows.length} leave types`);
    } catch (error) {
      console.error('   ✗ Failed to load leave types:', error);
    }
  }

  /**
   * Load upcoming holidays into cache
   */
  private static async loadHolidays(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearDate = nextYear.toISOString().split('T')[0];
      
      const [rows]: any = await pool.execute(
        `SELECT id, holiday_name, date, branch_id, is_mandatory, description 
         FROM holidays 
         WHERE date >= ? AND date <= ? 
         ORDER BY date`,
        [today, nextYearDate]
      );
      
      await CacheService.set(`${this.CACHE_PREFIX}holidays:upcoming`, rows, 86400);
      console.log(`   ✓ Loaded ${rows.length} upcoming holidays`);
    } catch (error) {
      console.error('   ✗ Failed to load holidays:', error);
    }
  }

  /**
   * Get cached system data
   */
  static async getSystemData(): Promise<{
    roles: any[];
    permissions: any[];
    branches: any[];
    departments: any[];
    leaveTypes: any[];
    holidays: any[];
  }> {
    const [
      roles,
      permissions,
      branches,
      departments,
      leaveTypes,
      holidays
    ] = await Promise.all([
      CacheService.get<any[]>(`${this.CACHE_PREFIX}roles`),
      CacheService.get<any[]>(`${this.CACHE_PREFIX}permissions:all`),
      CacheService.get<any[]>(`${this.CACHE_PREFIX}branches`),
      CacheService.get<any[]>(`${this.CACHE_PREFIX}departments`),
      CacheService.get<any[]>(`${this.CACHE_PREFIX}leave-types`),
      CacheService.get<any[]>(`${this.CACHE_PREFIX}holidays:upcoming`),
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

  /**
   * Refresh all system cache
   * Called when static data is updated
   */
  static async refreshAll(): Promise<void> {
    console.log('🔄 Refreshing all system cache...');
    
    // Clear all system cache
    await CacheService.invalidatePattern(`${this.CACHE_PREFIX}*`);
    
    // Reload everything
    await this.initialize();
  }

  /**
   * Refresh specific cache by type
   */
  static async refresh(type: 'roles' | 'permissions' | 'branches' | 'departments' | 'leaveTypes' | 'holidays'): Promise<void> {
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

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
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
  }> {
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
