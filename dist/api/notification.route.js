import { Router } from 'express';
import { getUserNotifications, markNotificationAsRead, updateUserNotificationPreferences, getNotificationPreferences, registerDevice, unregisterDevice } from '../controllers/notification.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
const router = Router();
router.use(authenticateJWT);
router.get('/my-notifications', getUserNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateUserNotificationPreferences);
router.post('/devices/register', registerDevice);
router.delete('/devices/unregister', unregisterDevice);
export default router;
//# sourceMappingURL=notification.route.js.map