import { Router } from 'express';
import { submitJobApplication, getApplicationById, getApplicationsByJobPosting, getApplicationsByApplicant } from '../controllers/application-submission.controller';
import { upload } from '../controllers/application-submission.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
const router = Router();
router.post('/', upload.single('resume'), submitJobApplication);
router.use(authenticateJWT);
router.get('/my-applications/:email', getApplicationsByApplicant);
router.get('/:id', getApplicationById);
router.get('/by-job/:job_posting_id', getApplicationsByJobPosting);
export default router;
//# sourceMappingURL=application-submission.route.js.map