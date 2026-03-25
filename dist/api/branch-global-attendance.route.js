import express from 'express';
import { updateGlobalAttendanceMode, getGlobalAttendanceMode } from '../controllers/branch-global-attendance.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = express.Router();
router.post('/global-attendance-mode', authenticateJWT, checkPermission('branches:update'), updateGlobalAttendanceMode);
router.get('/global-attendance-mode', authenticateJWT, checkPermission('branches:read'), getGlobalAttendanceMode);
export default router;
//# sourceMappingURL=branch-global-attendance.route.js.map