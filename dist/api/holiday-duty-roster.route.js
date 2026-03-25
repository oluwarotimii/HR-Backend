import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import HolidayDutyRosterController from '../controllers/holiday-duty-roster.controller';
const router = Router();
router.post('/', authenticateJWT, checkPermission('holiday-duty-roster:create'), HolidayDutyRosterController.create);
router.post('/bulk', authenticateJWT, checkPermission('holiday-duty-roster:create'), HolidayDutyRosterController.bulkCreate);
router.get('/', authenticateJWT, checkPermission('holiday-duty-roster:read'), HolidayDutyRosterController.getAll);
router.get('/:holidayId', authenticateJWT, checkPermission('holiday-duty-roster:read'), HolidayDutyRosterController.getByHolidayId);
router.get('/user/:userId', authenticateJWT, checkPermission('holiday-duty-roster:read'), HolidayDutyRosterController.getByUserId);
router.put('/:id', authenticateJWT, checkPermission('holiday-duty-roster:update'), HolidayDutyRosterController.update);
router.delete('/:id', authenticateJWT, checkPermission('holiday-duty-roster:delete'), HolidayDutyRosterController.delete);
export default router;
//# sourceMappingURL=holiday-duty-roster.route.js.map