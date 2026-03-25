import { Router } from 'express';
import { updateApplicationStatus, getAllApplications, withdrawApplication, addCommentToApplication, getCommentsForApplication } from '../controllers/application-management.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = Router();
router.use(authenticateJWT);
router.put('/:id/status', checkPermission('job_application:update'), updateApplicationStatus);
router.get('/', checkPermission('job_application:read'), getAllApplications);
router.put('/:id/withdraw', withdrawApplication);
router.post('/:id/comment', checkPermission('job_application:comment'), addCommentToApplication);
router.get('/:id/comments', getCommentsForApplication);
export default router;
//# sourceMappingURL=application-management.route.js.map