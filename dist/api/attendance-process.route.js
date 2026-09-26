"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const attendance_model_1 = __importDefault(require("../models/attendance.model"));
const attendance_processor_worker_1 = __importDefault(require("../workers/attendance-processor.worker"));
const router = (0, express_1.Router)();
router.post('/process', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('attendance:manage'), async (req, res) => {
    try {
        const { date, userId } = req.body;
        const currentUserId = req.currentUser?.id;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        let targetUserId = currentUserId;
        if (userId) {
            const currentUserRole = req.currentUser?.role_id;
            if (currentUserRole !== 1 && currentUserRole !== 3) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to process attendance for other users'
                });
            }
            targetUserId = userId;
        }
        const outcome = await attendance_processor_worker_1.default.processAttendanceForUser(targetUserId, new Date(date));
        if (outcome === 'skipped') {
            return res.status(409).json({
                success: false,
                message: 'Attendance already processed for this date'
            });
        }
        const newAttendance = await attendance_model_1.default.findByUserIdAndDate(targetUserId, new Date(date));
        return res.status(201).json({
            success: true,
            message: `Attendance processed successfully (${outcome})`,
            data: { attendance: newAttendance }
        });
    }
    catch (error) {
        console.error('Process attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/process-batch', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('attendance:manage'), async (req, res) => {
    try {
        const { date, userIds } = req.body;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User IDs array is required'
            });
        }
        const results = [];
        for (const userId of userIds) {
            const outcome = await attendance_processor_worker_1.default.processAttendanceForUser(userId, new Date(date));
            if (outcome === 'skipped') {
                results.push({
                    user_id: userId,
                    status: 'skipped',
                    message: 'Attendance already exists for this date'
                });
                continue;
            }
            const newAttendance = await attendance_model_1.default.findByUserIdAndDate(userId, new Date(date));
            results.push({
                user_id: userId,
                status: 'success',
                attendance: newAttendance
            });
        }
        return res.status(201).json({
            success: true,
            message: 'Batch attendance processing completed',
            data: { results }
        });
    }
    catch (error) {
        console.error('Batch process attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=attendance-process.route.js.map