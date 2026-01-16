import { Router } from 'express';
import { 
  getAllDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '../controllers/department-management.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Require authentication for all department management routes
router.use(authenticateJWT);

// Get all departments
router.get('/', getAllDepartments);

// Get department by ID
router.get('/:id', getDepartmentById);

// Create a new department - requires departments:create permission
router.post('/', checkPermission('departments:create'), createDepartment);

// Update a department - requires departments:update permission
router.put('/:id', checkPermission('departments:update'), updateDepartment);

// Delete a department - requires departments:delete permission
router.delete('/:id', checkPermission('departments:delete'), deleteDepartment);

export default router;