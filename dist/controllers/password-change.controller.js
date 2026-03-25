import UserModel from '../models/user.model';
import bcrypt from 'bcryptjs';
export const changePasswordAfterFirstLogin = async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        const user = await UserModel.findById(req.currentUser.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const isValidPassword = await UserModel.comparePassword(currentPassword, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await require('../config/database').pool.execute(`UPDATE ${UserModel.tableName} SET password_hash = ? WHERE id = ?`, [hashedNewPassword, req.currentUser.id]);
        await UserModel.setPasswordChangeRequirement(req.currentUser.id, false);
        return res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Change password after first login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const forcePasswordChange = async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const userId = parseInt(typeof idStr === 'string' ? idStr : '');
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const updatedUser = await UserModel.setPasswordChangeRequirement(userId, true);
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        return res.json({
            success: true,
            message: 'Password change requirement set successfully',
            data: { user: { id: updatedUser.id, email: updatedUser.email } }
        });
    }
    catch (error) {
        console.error('Force password change error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
//# sourceMappingURL=password-change.controller.js.map