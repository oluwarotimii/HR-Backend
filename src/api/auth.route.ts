import express from 'express';
import { login, logout, refreshToken, getPermissions } from '../controllers/auth.controller';
import { forgotPassword, resetPassword } from '../controllers/auth-reset.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import { companyEmailOnly } from '../middleware/company-email.middleware';

const router = express.Router();

// Public routes
router.post('/login', companyEmailOnly, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authenticateJWT, logout);
router.get('/permissions', authenticateJWT, getPermissions);

// Example of a route that requires a specific permission
// router.get('/admin-panel', authenticateJWT, checkPermission('admin.access'), adminController.getAdminData);

export default router;