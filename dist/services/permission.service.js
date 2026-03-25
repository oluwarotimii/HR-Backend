import UserModel from '../models/user.model';
import RoleModel from '../models/role.model';
import UserPermissionModel from '../models/user-permission.model';
import RolePermissionModel from '../models/role-permission.model';
import { CacheService } from './cache.service';
class PermissionService {
    static async hasPermission(userId, permission) {
        const userPermission = await UserPermissionModel.findByUserAndPermission(userId, permission);
        if (userPermission) {
            return {
                hasPermission: userPermission.allow_deny === 'allow',
                source: 'user',
                allowDeny: userPermission.allow_deny
            };
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return {
                hasPermission: false,
                source: 'none',
                allowDeny: null
            };
        }
        const role = await RoleModel.findById(user.role_id);
        if (role && role.permissions && role.permissions.includes('*')) {
            return {
                hasPermission: true,
                source: 'role',
                allowDeny: 'allow'
            };
        }
        const rolePermission = await RolePermissionModel.findByRoleAndPermission(user.role_id, permission);
        if (rolePermission) {
            return {
                hasPermission: rolePermission.allow_deny === 'allow',
                source: 'role',
                allowDeny: rolePermission.allow_deny
            };
        }
        return {
            hasPermission: false,
            source: 'none',
            allowDeny: null
        };
    }
    static async getAllUserPermissions(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            return [];
        }
        const role = await RoleModel.findById(user.role_id);
        if (role && role.permissions && role.permissions.includes('*')) {
            return [{
                    permission: '*',
                    source: 'role',
                    allowDeny: 'allow'
                }];
        }
        const userPermissions = await UserPermissionModel.getUserPermissions(userId);
        const userPermList = userPermissions.map(perm => ({
            permission: perm.permission,
            source: 'user',
            allowDeny: perm.allow_deny
        }));
        const rolePermissions = await RolePermissionModel.getRolePermissions(user.role_id);
        const rolePermList = rolePermissions
            .filter(rp => !userPermList.some(up => up.permission === rp.permission))
            .map(perm => ({
            permission: perm.permission,
            source: 'role',
            allowDeny: perm.allow_deny
        }));
        return [...userPermList, ...rolePermList];
    }
    static async generatePermissionManifest(userId) {
        const cacheKey = `user:permissions:${userId}`;
        const cachedManifest = await CacheService.get(cacheKey);
        if (cachedManifest) {
            return cachedManifest;
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return {};
        }
        const role = await RoleModel.findById(user.role_id);
        if (role && role.permissions && role.permissions.includes('*')) {
            const manifest = { '*': true };
            await CacheService.set(cacheKey, manifest, 3600);
            return manifest;
        }
        const allPermissions = await this.getAllUserPermissions(userId);
        const manifest = {};
        allPermissions.forEach(perm => {
            manifest[perm.permission] = perm.allowDeny === 'allow';
        });
        await CacheService.set(cacheKey, manifest, 3600);
        return manifest;
    }
    static async invalidateUserPermissionCache(userId) {
        const cacheKey = `user:permissions:${userId}`;
        await CacheService.del(cacheKey);
    }
    static async invalidateAllUserPermissionCaches() {
        await CacheService.invalidatePattern('user:permissions:*');
    }
}
export default PermissionService;
//# sourceMappingURL=permission.service.js.map