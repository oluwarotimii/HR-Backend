import { Router } from 'express';
import { inviteStaffMember, getAvailableRoles, getAvailableBranches, getAvailableDepartments, getAllInvitations, getPendingInvitations, resendInvitation, cancelInvitation, acceptInvitation } from '../controllers/staff-invitation.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = Router();
router.post('/accept/:token', acceptInvitation);
router.use(authenticateJWT);
router.post('/', checkPermission('staff:create'), inviteStaffMember);
router.get('/roles', getAvailableRoles);
router.get('/branches', getAvailableBranches);
router.get('/departments', getAvailableDepartments);
router.get('/invitations', checkPermission('staff:read'), getAllInvitations);
router.get('/invitations/pending', checkPermission('staff:read'), getPendingInvitations);
router.post('/invitations/:id/resend', checkPermission('staff:create'), resendInvitation);
router.delete('/invitations/:id', checkPermission('staff:delete'), cancelInvitation);
export default router;
//# sourceMappingURL=staff-invitation.route.js.map