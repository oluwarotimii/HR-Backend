import { Router } from 'express';
import attendanceRoutes from './attendance.route';
import attendanceCreateRoutes from './attendance-create.route';
import shiftTimingRoutes from './shift-timing.route';
import holidayRoutes from './holiday.route';
import attendanceLocationRoutes from './attendance-location.route';
import attendanceCheckRoutes from './attendance-check.route';

const router = Router();

// Mount check-in and check-out specific routes under their own paths
router.use('/', attendanceCheckRoutes); // This adds /check-in and /check-out routes
// Main attendance routes (get, update)
router.use('/', attendanceRoutes);
// Manual attendance creation route
router.use('/', attendanceCreateRoutes);
// Other routes need their own prefixes since they're mounted under /api/attendance
router.use('/shift-timings', shiftTimingRoutes);
router.use('/holidays', holidayRoutes);
router.use('/attendance-locations', attendanceLocationRoutes);

export default router