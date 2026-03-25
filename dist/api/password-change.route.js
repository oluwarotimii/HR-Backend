import express from 'express';
import { changePasswordAfterFirstLogin, forcePasswordChange } from '../controllers/password-change.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
const router = express.Router();
router.post('/change', authenticateJWT, changePasswordAfterFirstLogin);
router.patch('/force/:id', authenticateJWT, forcePasswordChange);
export default router;
//# sourceMappingURL=password-change.route.js.map