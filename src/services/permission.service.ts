import { pool } from '../config/database';
import { CacheService } from './cache.service';

interface PermissionCheckResult {
  hasPermission: boolean;
  source: 'user' | 'role' | 'none';
  allowDeny: 'allow' | 'deny' | null;
}

class PermissionService {
  /**
   * Checks if a user has a specific permission (single JOIN query replaces 4 separate queries)
   * User-specific permissions take precedence over role-based permissions
   */
  static async hasPermission(userId: number, permission: string): Promise<PermissionCheckResult> {
    const [rows]: any = await pool.execute(
      `SELECT
        up.allow_deny AS user_perm_allow_deny,
        rp.allow_deny AS role_perm_allow_deny,
        r.permissions AS role_wildcard
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_permissions up ON up.user_id = u.id AND up.permission = ?
      LEFT JOIN roles_permissions rp ON rp.role_id = u.role_id AND rp.permission = ?
      WHERE u.id = ?`,
      [permission, permission, userId]
    );

    const row = (rows as any[])[0];

    if (!row) {
      return { hasPermission: false, source: 'none', allowDeny: null };
    }

    // User-specific permission takes precedence
    if (row.user_perm_allow_deny) {
      return {
        hasPermission: row.user_perm_allow_deny === 'allow',
        source: 'user',
        allowDeny: row.user_perm_allow_deny
      };
    }

    // Check if role has wildcard '*'
    if (row.role_wildcard && row.role_wildcard.includes('*')) {
      return { hasPermission: true, source: 'role', allowDeny: 'allow' };
    }

    // Role-based permission
    if (row.role_perm_allow_deny) {
      return {
        hasPermission: row.role_perm_allow_deny === 'allow',
        source: 'role',
        allowDeny: row.role_perm_allow_deny
      };
    }

    return { hasPermission: false, source: 'none', allowDeny: null };
  }

  /**
   * Checks multiple permission formats in a single query (used by auth middleware for backward compatibility)
   */
  static async hasPermissionAny(userId: number, permissions: string[]): Promise<PermissionCheckResult> {
    const placeholders = permissions.map(() => '?').join(',');
    const [rows]: any = await pool.execute(
      `SELECT
        up.permission AS user_perm,
        up.allow_deny AS user_perm_allow_deny,
        rp.permission AS role_perm,
        rp.allow_deny AS role_perm_allow_deny,
        r.permissions AS role_wildcard
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_permissions up ON up.user_id = u.id AND up.permission IN (${placeholders})
      LEFT JOIN roles_permissions rp ON rp.role_id = u.role_id AND rp.permission IN (${placeholders})
      WHERE u.id = ?`,
      [...permissions, ...permissions, userId]
    );

    const results = rows as any[];

    if (results.length === 0) {
      return { hasPermission: false, source: 'none', allowDeny: null };
    }

    const firstRow = results[0];

    // Check wildcard first (fastest path)
    if (firstRow.role_wildcard && firstRow.role_wildcard.includes('*')) {
      return { hasPermission: true, source: 'role', allowDeny: 'allow' };
    }

    // Check user-specific permissions (take precedence)
    for (const row of results) {
      if (row.user_perm_allow_deny) {
        return {
          hasPermission: row.user_perm_allow_deny === 'allow',
          source: 'user',
          allowDeny: row.user_perm_allow_deny
        };
      }
    }

    // Check role-based permissions
    for (const row of results) {
      if (row.role_perm_allow_deny) {
        return {
          hasPermission: row.role_perm_allow_deny === 'allow',
          source: 'role',
          allowDeny: row.role_perm_allow_deny
        };
      }
    }

    return { hasPermission: false, source: 'none', allowDeny: null };
  }

  /**
   * Gets all permissions for a user (combining role and user-specific permissions)
   */
  static async getAllUserPermissions(userId: number): Promise<{permission: string, source: 'user' | 'role', allowDeny: 'allow' | 'deny'}[]> {
    const [rows]: any = await pool.execute(
      `SELECT r.permissions AS role_wildcard FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    const userRow = (rows as any[])[0];
    if (!userRow) {
      return [];
    }

    // Check if the user's role has the '*' (all permissions) wildcard
    if (userRow.role_wildcard && userRow.role_wildcard.includes('*')) {
      return [{
        permission: '*',
        source: 'role' as const,
        allowDeny: 'allow' as const
      }];
    }

    // Get user-specific and role permissions in 2 parallel queries
    const [userPermissions]: any = await pool.execute(
      `SELECT permission, allow_deny FROM user_permissions WHERE user_id = ?`,
      [userId]
    );

    const [rolePermissions]: any = await pool.execute(
      `SELECT rp.permission, rp.allow_deny FROM roles_permissions rp
       INNER JOIN users u ON u.role_id = rp.role_id
       WHERE u.id = ?`,
      [userId]
    );

    const userPermList = (userPermissions as any[]).map(perm => ({
      permission: perm.permission,
      source: 'user' as const,
      allowDeny: perm.allow_deny
    }));

    const rolePermList = (rolePermissions as any[])
      .filter((rp: any) => !userPermList.some(up => up.permission === rp.permission))
      .map((perm: any) => ({
        permission: perm.permission,
        source: 'role' as const,
        allowDeny: perm.allow_deny
      }));

    return [...userPermList, ...rolePermList];
  }

  /**
   * Generates a permission manifest for a user
   * This would be sent to the frontend to determine which UI elements to show
   */
  static async generatePermissionManifest(userId: number): Promise<Record<string, boolean>> {
    const cacheKey = `user:permissions:${userId}`;

    // Try to get from cache first
    const cachedManifest = await CacheService.get<Record<string, boolean>>(cacheKey);
    if (cachedManifest) {
      return cachedManifest;
    }

    // Single query to check user exists and role wildcard
    const [rows]: any = await pool.execute(
      `SELECT r.permissions AS role_wildcard FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    const userRow = (rows as any[])[0];
    if (!userRow) {
      return {};
    }

    // Check if the user's role has the '*' (all permissions) wildcard
    if (userRow.role_wildcard && userRow.role_wildcard.includes('*')) {
      const manifest = { '*': true };
      await CacheService.set(cacheKey, manifest, 3600);
      return manifest;
    }

    const allPermissions = await this.getAllUserPermissions(userId);

    const manifest: Record<string, boolean> = {};
    allPermissions.forEach(perm => {
      manifest[perm.permission] = perm.allowDeny === 'allow';
    });

    // Cache the result for 1 hour (3600 seconds)
    await CacheService.set(cacheKey, manifest, 3600);

    return manifest;
  }

  /**
   * Invalidate a user's permission cache
   */
  static async invalidateUserPermissionCache(userId: number): Promise<void> {
    const cacheKey = `user:permissions:${userId}`;
    await CacheService.del(cacheKey);
  }

  /**
   * Invalidate all user permission caches (useful when role permissions change)
   */
  static async invalidateAllUserPermissionCaches(): Promise<void> {
    await CacheService.invalidatePattern('user:permissions:*');
  }
}

export default PermissionService;