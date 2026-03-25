import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { createShiftException, getAllShiftExceptions, getMyShiftExceptions, getShiftExceptionById, updateShiftException, deleteShiftException } from '../controllers/shift-exception.controller';
const router = Router();
router.get('/my', authenticateJWT, getMyShiftExceptions);
router.post('/', authenticateJWT, checkPermission('shift_exception:create'), createShiftException);
router.get('/', authenticateJWT, checkPermission('shift_exception:read'), getAllShiftExceptions);
router.get('/:id', authenticateJWT, checkPermission('shift_exception:read'), getShiftExceptionById);
router.put('/:id', authenticateJWT, checkPermission('shift_exception:update'), updateShiftException);
router.delete('/:id', authenticateJWT, checkPermission('shift_exception:delete'), deleteShiftException);
export default router;
//# sourceMappingURL=shift-exception.route.js.map