import { Router } from 'express';
import { 
  getAllBranches, 
  getBranchById, 
  createBranch, 
  updateBranch, 
  deleteBranch 
} from '../controllers/branch-management.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Require authentication for all branch management routes
router.use(authenticateJWT);

// Get all branches
router.get('/', getAllBranches);

// Get branch by ID
router.get('/:id', getBranchById);

// Create a new branch - requires branches:create permission
router.post('/', checkPermission('branches:create'), createBranch);

// Update a branch - requires branches:update permission
router.put('/:id', checkPermission('branches:update'), updateBranch);

// Delete (deactivate) a branch - requires branches:delete permission
router.delete('/:id', checkPermission('branches:delete'), deleteBranch);

export default router;