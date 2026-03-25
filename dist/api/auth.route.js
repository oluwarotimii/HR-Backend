import express from 'express';
import { login, logout, refreshToken, getPermissions } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { companyEmailOnly } from '../middleware/company-email.middleware';
const router = express.Router();
router.post('/login', companyEmailOnly, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateJWT, logout);
router.get('/permissions', authenticateJWT, getPermissions);
export default router;
//# sourceMappingURL=auth.route.js.map