import express from 'express';
import { 
  getAllStaff, 
  getStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff,
  terminateStaff,
  getStaffByDepartment
} from '../controllers/staff.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Staff management routes
router.get('/', authenticateJWT, checkPermission('staff.view'), getAllStaff);
router.get('/:id', authenticateJWT, checkPermission('staff.view'), getStaffById);
router.post('/', authenticateJWT, checkPermission('staff.create'), createStaff);
router.put('/:id', authenticateJWT, checkPermission('staff.update'), updateStaff);
router.delete('/:id', authenticateJWT, checkPermission('staff.delete'), deleteStaff);
router.patch('/:id/terminate', authenticateJWT, checkPermission('staff.terminate'), terminateStaff);

// Get staff by department
router.get('/department/:department', authenticateJWT, checkPermission('staff.view'), getStaffByDepartment);

export default router;