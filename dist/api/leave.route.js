import { Router } from 'express';
import leaveTypeRoutes from './leave-type.route';
import leaveRequestRoutes from './leave-request.route';
import leaveAllocationRoutes from './leave-allocation.route';
import leaveFileRoutes from './leave-file.route';
const router = Router();
router.use('/', leaveFileRoutes);
router.use('/types', leaveTypeRoutes);
router.use('/allocations', leaveAllocationRoutes);
router.use('/', leaveRequestRoutes);
export default router;
//# sourceMappingURL=leave.route.js.map