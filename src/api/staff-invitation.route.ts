import { Router } from 'express';
import { 
  inviteStaffMember, 
  getAvailableRoles, 
  getAvailableBranches, 
  getAvailableDepartments 
} from '../controllers/staff-invitation.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Require authentication for all staff invitation routes
router.use(authenticateJWT);

// Invite a new staff member - requires staff:create permission
router.post('/', checkPermission('staff:create'), inviteStaffMember);

// Get available roles for assignment
router.get('/roles', getAvailableRoles);

// Get available branches for assignment
router.get('/branches', getAvailableBranches);

// Get available departments for assignment
router.get('/departments', getAvailableDepartments);

export default router;