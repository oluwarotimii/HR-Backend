import UserModel from '../models/user.model';
import RoleModel from '../models/role.model';
import UserPermissionModel from '../models/user-permission.model';
import RolePermissionModel from '../models/role-permission.model';

interface PermissionCheckResult {
  hasPermission: boolean;
  source: 'user' | 'role' | 'none'; // Where the permission came from
  allowDeny: 'allow' | 'deny' | null; // Whether it was explicitly allowed or denied
}

class PermissionService {
  /**
   * Checks if a user has a specific permission
   * User-specific permissions take precedence over role-based permissions
   */
  static async hasPermission(userId: number, permission: string): Promise<PermissionCheckResult> {
    // First, check if the user has an explicit permission
    const userPermission = await UserPermissionModel.findByUserAndPermission(userId, permission);

    if (userPermission) {
      // User has an explicit permission, return it
      return {
        hasPermission: userPermission.allow_deny === 'allow',
        source: 'user',
        allowDeny: userPermission.allow_deny
      };
    }

    // If no user-specific permission, check the user's role
    const user = await UserModel.findById(userId);
    if (!user) {
      return {
        hasPermission: false,
        source: 'none',
        allowDeny: null
      };
    }

    // Check if the user's role has the '*' (all permissions) wildcard
    const role = await RoleModel.findById(user.role_id);
    if (role && role.permissions && role.permissions.includes('*')) {
      return {
        hasPermission: true,
        source: 'role',
        allowDeny: 'allow'
      };
    }

    // Get the role's specific permission
    const rolePermission = await RolePermissionModel.findByRoleAndPermission(user.role_id, permission);

    if (rolePermission) {
      // Role has the permission
      return {
        hasPermission: rolePermission.allow_deny === 'allow',
        source: 'role',
        allowDeny: rolePermission.allow_deny
      };
    }

    // No permission found anywhere
    return {
      hasPermission: false,
      source: 'none',
      allowDeny: null
    };
  }

  /**
   * Gets all permissions for a user (combining role and user-specific permissions)
   */
  static async getAllUserPermissions(userId: number): Promise<{permission: string, source: 'user' | 'role', allowDeny: 'allow' | 'deny'}[]> {
    const user = await UserModel.findById(userId);
    if (!user) {
      return [];
    }

    // Check if the user's role has the '*' (all permissions) wildcard
    const role = await RoleModel.findById(user.role_id);
    if (role && role.permissions && role.permissions.includes('*')) {
      // If role has '*' permission, return a special indicator
      return [{
        permission: '*',
        source: 'role' as const,
        allowDeny: 'allow' as const
      }];
    }

    // Get user-specific permissions
    const userPermissions = await UserPermissionModel.getUserPermissions(userId);
    const userPermList = userPermissions.map(perm => ({
      permission: perm.permission,
      source: 'user' as const,
      allowDeny: perm.allow_deny
    }));

    // Get role-based permissions
    const rolePermissions = await RolePermissionModel.getRolePermissions(user.role_id);
    const rolePermList = rolePermissions
      .filter(rp => !userPermList.some(up => up.permission === rp.permission)) // Exclude if already defined in user perms
      .map(perm => ({
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
    const user = await UserModel.findById(userId);
    if (!user) {
      return {};
    }

    // Check if the user's role has the '*' (all permissions) wildcard
    const role = await RoleModel.findById(user.role_id);
    if (role && role.permissions && role.permissions.includes('*')) {
      // If role has '*' permission, return a special manifest indicating all permissions
      return { '*': true };
    }

    const allPermissions = await this.getAllUserPermissions(userId);

    const manifest: Record<string, boolean> = {};
    allPermissions.forEach(perm => {
      manifest[perm.permission] = perm.allowDeny === 'allow';
    });

    return manifest;
  }
}

export default PermissionService;