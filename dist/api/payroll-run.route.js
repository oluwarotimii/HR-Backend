import express from 'express';
import { getAllPayrollRuns, getPayrollRunById, createPayrollRun, updatePayrollRun, executePayrollRun, deletePayrollRun } from '../controllers/payroll-run.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = express.Router();
router.get('/', authenticateJWT, checkPermission('payroll_run:read'), getAllPayrollRuns);
router.get('/:id', authenticateJWT, checkPermission('payroll_run:read'), getPayrollRunById);
router.post('/', authenticateJWT, checkPermission('payroll_run.create'), createPayrollRun);
router.put('/:id', authenticateJWT, checkPermission('payroll_run.update'), updatePayrollRun);
router.delete('/:id', authenticateJWT, checkPermission('payroll_run.delete'), deletePayrollRun);
router.post('/:id/execute', authenticateJWT, checkPermission('payroll_run.execute'), executePayrollRun);
export default router;
//# sourceMappingURL=payroll-run.route.js.map