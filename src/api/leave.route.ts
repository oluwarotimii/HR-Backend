import { Router } from 'express';
import leaveTypeRoutes from './leave-type.route';

const router = Router();

// Mount leave type routes
router.use('/types', leaveTypeRoutes);

export default router;