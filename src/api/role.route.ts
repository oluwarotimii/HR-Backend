import express from 'express';
import { 
  getAllRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole,
  getRolePermissions,
  addRolePermission,
  removeRolePermission
} from '../controllers/role.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Role management routes
router.get('/', authenticateJWT, checkPermission('role.view'), getAllRoles);
router.get('/:id', authenticateJWT, checkPermission('role.view'), getRoleById);
router.post('/', authenticateJWT, checkPermission('role.create'), createRole);
router.put('/:id', authenticateJWT, checkPermission('role.update'), updateRole);
router.delete('/:id', authenticateJWT, checkPermission('role.delete'), deleteRole);

// Role permissions management routes
router.get('/:id/permissions', authenticateJWT, checkPermission('role.permissions.view'), getRolePermissions);
router.post('/:id/permissions', authenticateJWT, checkPermission('role.permissions.manage'), addRolePermission);
router.delete('/:id/permissions/:permission', authenticateJWT, checkPermission('role.permissions.manage'), removeRolePermission);

export default router;