import PermissionService from '../services/permission.service';
export const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            const permissionResult = await PermissionService.hasPermission(req.currentUser.id, permission);
            if (!permissionResult.hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required: ${permission}`,
                    requiredPermission: permission,
                    permissionSource: permissionResult.source
                });
            }
            return next();
        }
        catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during permission check'
            });
        }
    };
};
export const attachPermissions = async (req, res, next) => {
    try {
        if (req.currentUser) {
            const permissions = await PermissionService.generatePermissionManifest(req.currentUser.id);
            req.currentUser.permissions = permissions;
        }
        return next();
    }
    catch (error) {
        console.error('Error attaching permissions:', error);
        return next();
    }
};
//# sourceMappingURL=permission.middleware.js.map