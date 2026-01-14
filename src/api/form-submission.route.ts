import express from 'express';
import { 
  getAllFormSubmissions, 
  getFormSubmissionById, 
  submitForm, 
  updateFormSubmission, 
  deleteFormSubmission
} from '../controllers/form-submission.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Form submission routes
router.get('/', authenticateJWT, checkPermission('form.submission.view'), getAllFormSubmissions);
router.get('/:id', authenticateJWT, checkPermission('form.submission.view'), getFormSubmissionById);
router.post('/', authenticateJWT, checkPermission('form.submission.create'), submitForm);
router.put('/:id', authenticateJWT, checkPermission('form.submission.update'), updateFormSubmission);
router.delete('/:id', authenticateJWT, checkPermission('form.submission.delete'), deleteFormSubmission);

export default router;