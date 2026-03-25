import { Router } from 'express';
import { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch } from '../controllers/branch-management.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = Router();
router.use(authenticateJWT);
router.get('/', authenticateJWT, checkPermission('branches:read'), getAllBranches);
router.get('/:id', authenticateJWT, checkPermission('branches:read'), getBranchById);
router.post('/', checkPermission('branches:create'), createBranch);
router.put('/:id', checkPermission('branches:update'), updateBranch);
router.delete('/:id', checkPermission('branches:delete'), deleteBranch);
export default router;
//# sourceMappingURL=branch-management.route.js.map