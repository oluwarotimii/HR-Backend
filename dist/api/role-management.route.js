import { Router } from 'express';
import { createRole, getAvailablePermissions, getAllRoles, updateRole, deleteRole } from '../controllers/role-management.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = Router();
router.use(authenticateJWT);
router.get('/permissions', getAvailablePermissions);
router.get('/', getAllRoles);
router.post('/', checkPermission('roles:create'), createRole);
router.put('/:id', checkPermission('roles:update'), updateRole);
router.delete('/:id', checkPermission('roles:delete'), deleteRole);
export default router;
//# sourceMappingURL=role-management.route.js.map