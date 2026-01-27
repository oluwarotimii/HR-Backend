import express from 'express';
import { 
  getAllForms, 
  getFormById, 
  createForm, 
  updateForm, 
  deleteForm,
  getFormFields
} from '../controllers/form.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Form management routes
router.get('/', authenticateJWT, checkPermission('forms:read'), getAllForms);
router.get('/:id', authenticateJWT, checkPermission('forms:read'), getFormById);
router.post('/', authenticateJWT, checkPermission('form.create'), createForm);
router.put('/:id', authenticateJWT, checkPermission('form.update'), updateForm);
router.delete('/:id', authenticateJWT, checkPermission('form.delete'), deleteForm);

// Get form fields
router.get('/:id/fields', authenticateJWT, checkPermission('forms:read'), getFormFields);

export default router;