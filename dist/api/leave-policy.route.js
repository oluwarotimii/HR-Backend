"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
const getDefaultPolicy = () => ({
    id: 1,
    exclude_sundays_from_leave: false,
    created_at: new Date(),
    updated_at: new Date()
});
router.get('/', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        const [rows] = await database_1.pool.execute(`SELECT id, exclude_sundays_from_leave, created_at, updated_at
       FROM global_attendance_settings
       LIMIT 1`);
        const policy = rows[0] || getDefaultPolicy();
        return res.json({
            success: true,
            message: 'Leave policy retrieved successfully',
            data: { settings: policy }
        });
    }
    catch (error) {
        console.error('Get leave policy error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.patch('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('settings:configure'), async (req, res) => {
    try {
        const { settings } = req.body;
        if (!settings) {
            return res.status(400).json({
                success: false,
                message: 'Settings object is required'
            });
        }
        const excludeSundays = settings.exclude_sundays_from_leave;
        if (typeof excludeSundays === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'exclude_sundays_from_leave is required'
            });
        }
        const [existingRows] = await database_1.pool.execute(`SELECT id FROM global_attendance_settings LIMIT 1`);
        if (existingRows.length > 0) {
            await database_1.pool.execute(`UPDATE global_attendance_settings
         SET exclude_sundays_from_leave = ?, updated_at = NOW()
         WHERE id = ?`, [Boolean(excludeSundays), existingRows[0].id]);
        }
        else {
            await database_1.pool.execute(`INSERT INTO global_attendance_settings (id, exclude_sundays_from_leave)
         VALUES (1, ?)`, [Boolean(excludeSundays)]);
        }
        const [updatedRows] = await database_1.pool.execute(`SELECT id, exclude_sundays_from_leave, created_at, updated_at
       FROM global_attendance_settings
       LIMIT 1`);
        return res.json({
            success: true,
            message: 'Leave policy updated successfully',
            data: { settings: updatedRows[0] || getDefaultPolicy() }
        });
    }
    catch (error) {
        console.error('Update leave policy error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=leave-policy.route.js.map