import express, { Request, Response, NextFunction } from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  terminateStaff,
  getStaffByDepartment,
  getCurrentUserStaffDetails,
  getDynamicFields,
  createDynamicField,
  updateDynamicField,
  deleteDynamicField,
  getStaffDynamicValues,
  setStaffDynamicValues
} from '../controllers/staff.controller';
import { uploadProfilePhoto, upload } from '../controllers/staff-photo.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import StaffModel from '../models/staff.model';
import UserModel from '../models/user.model';

// Extend the Express Request type to include numericId
declare global {
  namespace Express {
    interface Request {
      numericId?: number;
    }
  }
}

const router = express.Router();

// Middleware to validate that the id parameter is numeric
const validateNumericId = (req: Request, res: Response, next: NextFunction) => {
  // Try multiple parameter names (id, userId, staffId)
  const id = req.params.id || req.params.userId || req.params.staffId;
  const idString = Array.isArray(id) ? id[0] : id;
  const numericId = parseInt(idString);

  console.log('[Backend Route] validateNumericId called');
  console.log('[Backend Route] req.params:', req.params);
  console.log('[Backend Route] Extracted id param:', id);
  console.log('[Backend Route] idString:', idString);
  console.log('[Backend Route] Parsed numericId:', numericId);
  console.log('[Backend Route] isNaN(numericId):', isNaN(numericId));

  if (isNaN(numericId)) {
    console.log('[Backend Route] ❌ Invalid numeric ID');
    return res.status(400).json({
      success: false,
      message: 'Invalid staff ID. Expected a numeric ID.'
    });
  }

  console.log('[Backend Route] ✅ Valid numeric ID, setting req.numericId:', numericId);
  req.numericId = numericId;
  return next();
};

// Middleware to validate numeric IDs for dynamic fields
const validateNumericIdParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const idString = Array.isArray(id) ? id[0] : id;
    const numericId = parseInt(idString);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}. Expected a numeric ID.`
      });
    }

    req.numericId = numericId;
    return next();
  };
};

// Staff management routes
// More specific routes first
router.get('/me', authenticateJWT, getCurrentUserStaffDetails);
// Safest self-service update endpoint (avoids staff.id vs user.id confusion)
router.put('/me', authenticateJWT, async (req: Request, res: Response) => {
  req.numericId = req.currentUser?.id;
  req.params.userId = String(req.currentUser?.id ?? '');
  return import('../controllers/staff.controller').then(({ updateStaff }) => updateStaff(req, res));
});
router.post(
  '/me/upload-photo',
  authenticateJWT,
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    req.numericId = req.currentUser.id;
    req.params.id = String(req.currentUser.id);
    (req as any).resolvedUserId = req.currentUser.id;
    return next();
  },
  upload.single('profile_picture'),
  uploadProfilePhoto
);
router.get('/', authenticateJWT, checkPermission('staff:read'), getAllStaff);

// GET /:id - Allow self-access, otherwise require 'staff:read' permission
router.get('/:id', authenticateJWT, validateNumericId, async (req: Request, res: Response, next: NextFunction) => {
  const requestedId = req.numericId;
  const requesterUserId = req.currentUser?.id;

  if (!requesterUserId || requestedId === undefined) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  let isSelfAccess = requesterUserId === requestedId;
  if (!isSelfAccess) {
    try {
      const requesterStaff = await StaffModel.findByUserId(requesterUserId);
      if (requesterStaff && requesterStaff.id === requestedId) {
        isSelfAccess = true;
      }
    } catch (err) {
      console.error('[Backend Route] Failed to resolve requester staff for self-access check:', err);
    }
  }

  if (isSelfAccess) return next();
  return checkPermission('staff:read')(req, res, next);
}, getStaffById);

router.post('/', authenticateJWT, checkPermission('staff.create'), createStaff);

// PUT /:userId - Update staff record by user_id
// Users can update their own staff record, admins can update anyone's
router.put('/:userId', authenticateJWT, validateNumericId, async (req: Request, res: Response) => {
  console.log('========================================');
  console.log('[Backend Route] PUT /staff/:userId handler called');
  console.log('[Backend Route] req.params.userId:', req.params.userId);
  console.log('[Backend Route] req.numericId:', req.numericId);
  console.log('[Backend Route] req.currentUser.id:', req.currentUser?.id);
  console.log('========================================');
  
  const requestedId = req.numericId;
  const requesterUserId = req.currentUser?.id;

  if (!requesterUserId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  // Self-update is allowed when the URL param is either:
  // - the user's own `users.id`, OR
  // - the user's own `staff.id` (backward compatibility for older clients)
  let isSelfUpdate = requesterUserId === requestedId;

  if (!isSelfUpdate) {
    try {
      const requesterStaff = await StaffModel.findByUserId(requesterUserId);
      if (requesterStaff && requesterStaff.id === requestedId) {
        isSelfUpdate = true;
        console.log('[Backend Route] Self-update detected via staff.id (backward compatible)');
      }
    } catch (err) {
      console.error('[Backend Route] Failed to resolve requester staff for self-update check:', err);
    }
  }

  if (!isSelfUpdate) {
    console.log('[Backend Route] Cross-user update attempt (permission required)');
    return checkPermission('staff.update')(req, res, () => {
      import('../controllers/staff.controller').then(({ updateStaff }) => updateStaff(req, res));
    });
  }

  console.log('[Backend Route] Self-update allowed');
  return import('../controllers/staff.controller').then(({ updateStaff }) => updateStaff(req, res));
});

router.delete('/:id', authenticateJWT, checkPermission('staff.delete'), validateNumericId, deleteStaff);
router.patch('/:id/terminate', authenticateJWT, checkPermission('staff.terminate'), validateNumericId, terminateStaff);

// Get staff by department
router.get('/department/:department', authenticateJWT, checkPermission('staff:read'), getStaffByDepartment);

// Dynamic fields routes (simplified)
router.get('/dynamic-fields', authenticateJWT, checkPermission('staff:read'), getDynamicFields);
router.post('/dynamic-fields', authenticateJWT, checkPermission('staff.create'), createDynamicField);
router.put('/dynamic-fields/:id', authenticateJWT, checkPermission('staff.update'), validateNumericIdParam('id'), updateDynamicField);
router.delete('/dynamic-fields/:id', authenticateJWT, checkPermission('staff.delete'), validateNumericIdParam('id'), deleteDynamicField);

// Staff dynamic values routes
router.get('/dynamic-values/:staffId', authenticateJWT, checkPermission('staff:read'), validateNumericIdParam('staffId'), getStaffDynamicValues);
router.post('/dynamic-values/:staffId', authenticateJWT, checkPermission('staff.update'), validateNumericIdParam('staffId'), setStaffDynamicValues);

// Profile photo upload route
const resolveProfilePhotoTargetUserId = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const rawId = req.numericId ?? parseInt(String(req.params.id ?? ''), 10);
  if (Number.isNaN(rawId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  const isSuperAdmin = req.currentUser.role_id === 1;
  if (!isSuperAdmin) {
    (req as any).resolvedUserId = req.currentUser.id;
    return next();
  }

  // Allow super admin to upload their own photo using their user id (even if the numeric id
  // also matches some staff.id belonging to a different user).
  if (rawId === req.currentUser.id) {
    (req as any).resolvedUserId = rawId;
    return next();
  }

  const idType = String(req.query.idType || req.query.id_type || '').toLowerCase();

  if (idType === 'staff') {
    const staff = await StaffModel.findById(rawId);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff record not found for the provided staff ID' });
    }
    (req as any).resolvedUserId = staff.user_id;
    return next();
  }

  if (idType === 'user') {
    const user = await UserModel.findById(rawId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found for the provided user ID' });
    }
    (req as any).resolvedUserId = rawId;
    return next();
  }

  const [user, staffByStaffId] = await Promise.all([
    UserModel.findById(rawId),
    StaffModel.findById(rawId)
  ]);

  if (user && staffByStaffId && staffByStaffId.user_id !== rawId) {
    return res.status(409).json({
      success: false,
      message: 'Ambiguous identifier: matches both a user ID and a staff ID. Retry with ?idType=user or ?idType=staff.'
    });
  }

  (req as any).resolvedUserId = staffByStaffId ? staffByStaffId.user_id : rawId;
  return next();
};

router.post(
  '/:id/upload-photo',
  authenticateJWT,
  validateNumericId,
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    // Non-admin users can only upload their own photo; handler enforces the target.
    if (req.currentUser.role_id !== 1) return next();
    return checkPermission('staff.update')(req, res, next);
  },
  resolveProfilePhotoTargetUserId,
  upload.single('profile_picture'),
  uploadProfilePhoto
);

export default router;
