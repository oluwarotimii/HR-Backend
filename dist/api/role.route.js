import express from 'express';
import { getAllRoles, getRoleById, createRole, updateRole, deleteRole, getRolePermissions, addRolePermission, removeRolePermission } from '../controllers/role.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = express.Router();
router.get('/', authenticateJWT, checkPermission('roles:read'), getAllRoles);
router.get('/:id', authenticateJWT, checkPermission('roles:read'), getRoleById);
router.post('/', authenticateJWT, checkPermission('role.create'), createRole);
router.put('/:id', authenticateJWT, checkPermission('role.update'), updateRole);
router.delete('/:id', authenticateJWT, checkPermission('role.delete'), deleteRole);
router.get('/:id/permissions', authenticateJWT, checkPermission('role.permissions.view'), getRolePermissions);
router.post('/:id/permissions', authenticateJWT, checkPermission('role.permissions.manage'), addRolePermission);
router.delete('/:id/permissions/:permission', authenticateJWT, checkPermission('role.permissions.manage'), removeRolePermission);
export default router;
//# sourceMappingURL=role.route.js.map