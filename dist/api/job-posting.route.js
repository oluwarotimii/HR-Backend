import { Router } from 'express';
import { getAllJobPostings, getJobPostingById, createJobPosting, updateJobPosting, closeJobPosting, deleteJobPosting } from '../controllers/job-posting.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = Router();
router.get('/', authenticateJWT, checkPermission('job_posting:read'), getAllJobPostings);
router.get('/:id', authenticateJWT, checkPermission('job_posting:read'), getJobPostingById);
router.use(authenticateJWT);
router.post('/', checkPermission('job_posting:create'), createJobPosting);
router.put('/:id', checkPermission('job_posting:update'), updateJobPosting);
router.post('/:id/close', checkPermission('job_posting:update'), closeJobPosting);
router.delete('/:id', checkPermission('job_posting:delete'), deleteJobPosting);
export default router;
//# sourceMappingURL=job-posting.route.js.map