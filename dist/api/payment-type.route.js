import express from 'express';
import { getAllPaymentTypes, getPaymentTypeById, createPaymentType, updatePaymentType, deletePaymentType, activatePaymentType } from '../controllers/payment-type.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = express.Router();
router.get('/', authenticateJWT, checkPermission('payment_type:read'), getAllPaymentTypes);
router.get('/:id', authenticateJWT, checkPermission('payment_type:read'), getPaymentTypeById);
router.post('/', authenticateJWT, checkPermission('payment_type.create'), createPaymentType);
router.put('/:id', authenticateJWT, checkPermission('payment_type.update'), updatePaymentType);
router.delete('/:id', authenticateJWT, checkPermission('payment_type.delete'), deletePaymentType);
router.patch('/:id/activate', authenticateJWT, checkPermission('payment_type.update'), activatePaymentType);
export default router;
//# sourceMappingURL=payment-type.route.js.map