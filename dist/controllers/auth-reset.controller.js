"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const email_service_1 = require("../services/email.service");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        const user = await user_model_1.default.findByEmail(email);
        if (!user) {
            return res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            });
        }
        if (user.status !== 'active') {
            return res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            });
        }
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, type: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' });
        const portalUrl = process.env.STAFF_PORTAL_URL || 'https://tms.femtechaccess.com.ng';
        const resetLink = `${portalUrl}/reset-password?token=${resetToken}`;
        console.log('\n=== PASSWORD RESET LINK (dev only) ===');
        console.log(resetLink);
        console.log('=========================================\n');
        try {
            await (0, email_service_1.sendForgotPasswordEmail)({
                to: user.email,
                fullName: user.full_name,
                resetLink
            });
        }
        catch (emailError) {
            console.error('Forgot password email failed to send:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email. Please try again later.'
            });
        }
        return res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (jwtError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        if (decoded.type !== 'password_reset') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token'
            });
        }
        const user = await user_model_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }
        await user_model_1.default.update(decoded.userId, {
            password: newPassword,
            must_change_password: false
        });
        return res.json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth-reset.controller.js.map