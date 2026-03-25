import { Router } from 'express';
import { getAllExceptionTypes, getExceptionTypeById, createExceptionType, updateExceptionType, deleteExceptionType, toggleExceptionTypeActive } from '../controllers/exception-type.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = Router();
router.use(authenticateJWT);
router.get('/', checkPermission('shift_exception_type:read'), getAllExceptionTypes);
router.get('/:id', checkPermission('shift_exception_type:read'), getExceptionTypeById);
router.post('/', checkPermission('shift_exception_type:create'), createExceptionType);
router.put('/:id', checkPermission('shift_exception_type:update'), updateExceptionType);
router.delete('/:id', checkPermission('shift_exception_type:delete'), deleteExceptionType);
router.patch('/:id/toggle', checkPermission('shift_exception_type:update'), toggleExceptionTypeActive);
export default router;
//# sourceMappingURL=shift-exception-type.route.js.map