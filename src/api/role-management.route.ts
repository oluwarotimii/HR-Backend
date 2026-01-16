import { Router } from 'express';
import { 
  createRole, 
  getAvailablePermissions, 
  getAllRoles, 
  updateRole, 
  deleteRole 
} from '../controllers/role-management.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Require authentication for all role management routes
router.use(authenticateJWT);

// Get all available permissions for role creation
router.get('/permissions', getAvailablePermissions);

// Get all roles
router.get('/', getAllRoles);

// Create a new role - requires roles:create permission
router.post('/', checkPermission('roles:create'), createRole);

// Update a role - requires roles:update permission
router.put('/:id', checkPermission('roles:update'), updateRole);

// Delete a role - requires roles:delete permission
router.delete('/:id', checkPermission('roles:delete'), deleteRole);

export default router;