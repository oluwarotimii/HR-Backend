import express, { Request, Response, NextFunction } from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  terminateStaff,
  getStaffByDepartment,
  getCurrentUserStaffDetails
} from '../controllers/staff.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Middleware to validate that the id parameter is numeric
const validateNumericId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid staff ID. Expected a numeric ID.'
    });
  }

  req.numericId = numericId;
  next();
};

// Staff management routes
// More specific routes first
router.get('/me', authenticateJWT, getCurrentUserStaffDetails);
router.get('/', authenticateJWT, checkPermission('staff:read'), getAllStaff);
router.get('/:id', authenticateJWT, checkPermission('staff:read'), validateNumericId, getStaffById);
router.post('/', authenticateJWT, checkPermission('staff.create'), createStaff);
router.put('/:id', authenticateJWT, checkPermission('staff.update'), validateNumericId, updateStaff);
router.delete('/:id', authenticateJWT, checkPermission('staff.delete'), validateNumericId, deleteStaff);
router.patch('/:id/terminate', authenticateJWT, checkPermission('staff.terminate'), validateNumericId, terminateStaff);

// Get staff by department
router.get('/department/:department', authenticateJWT, checkPermission('staff:read'), getStaffByDepartment);

export default router;