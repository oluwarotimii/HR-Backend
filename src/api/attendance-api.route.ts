import { Router } from 'express';
import attendanceRoutes from './attendance.route';
import shiftTimingRoutes from './shift-timing.route';
import holidayRoutes from './holiday.route';
import attendanceLocationRoutes from './attendance-location.route';

const router = Router();

// Mount attendance-related routes
router.use('/attendance', attendanceRoutes);
router.use('/shift-timings', shiftTimingRoutes);
router.use('/holidays', holidayRoutes);
router.use('/attendance-locations', attendanceLocationRoutes);

export default router;