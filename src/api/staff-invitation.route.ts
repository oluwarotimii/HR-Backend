import { Router } from 'express';
import {
  inviteStaffMember,
  getAvailableRoles,
  getAvailableBranches,
  getAvailableDepartments,
  getAllInvitations,
  getPendingInvitations,
  resendInvitation,
  cancelInvitation,
  acceptInvitation
} from '../controllers/staff-invitation.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Public route - no authentication required
router.post('/accept/:token', acceptInvitation);

// Protected routes - require authentication
router.use(authenticateJWT);

// Invite a new staff member
router.post('/', checkPermission('staff:create'), inviteStaffMember);

// Get available roles for assignment
router.get('/roles', getAvailableRoles);

// Get available branches for assignment
router.get('/branches', getAvailableBranches);

// Get available departments for assignment
router.get('/departments', getAvailableDepartments);

// Get all invitations
router.get('/invitations', checkPermission('staff:read'), getAllInvitations);

// Get pending invitations
router.get('/invitations/pending', checkPermission('staff:read'), getPendingInvitations);

// Resend invitation
router.post('/invitations/:id/resend', checkPermission('staff:create'), resendInvitation);

// Cancel invitation
router.delete('/invitations/:id', checkPermission('staff:delete'), cancelInvitation);

export default router;
