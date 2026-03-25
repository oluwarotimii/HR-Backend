import { Router } from 'express';
import { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/department-management.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = Router();
router.use(authenticateJWT);
router.get('/', authenticateJWT, checkPermission('departments:read'), getAllDepartments);
router.get('/:id', authenticateJWT, checkPermission('departments:read'), getDepartmentById);
router.post('/', checkPermission('departments:create'), createDepartment);
router.put('/:id', checkPermission('departments:update'), updateDepartment);
router.delete('/:id', checkPermission('departments:delete'), deleteDepartment);
export default router;
//# sourceMappingURL=department-management.route.js.map