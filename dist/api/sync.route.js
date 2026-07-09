"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const attendance_model_1 = __importDefault(require("../models/attendance.model"));
const shift_timing_model_1 = __importDefault(require("../models/shift-timing.model"));
const shift_exception_model_1 = __importDefault(require("../models/shift-exception.model"));
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
router.get('/dashboard-data', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.currentUser?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const [branchRows] = await database_1.pool.execute(`SELECT s.branch_id, b.name AS branch_name, b.location_coordinates,
              b.location_radius_meters, b.attendance_mode, b.status
       FROM staff s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = ?`, [userId]);
        const settings = branchRows[0] || null;
        const [locRows] = await database_1.pool.execute(`SELECT al.*, TRUE AS is_primary, TRUE AS assignment_active
       FROM staff_location_assignments sla
       JOIN attendance_locations al ON sla.assigned_location_id = al.id
       WHERE sla.user_id = ? AND al.is_active = 1`, [userId]);
        const todayAttendance = await attendance_model_1.default.findByUserIdAndDate(userId, new Date(today));
        const monthEnd = new Date();
        const monthAttendance = await attendance_model_1.default.findByDateRange(userId, new Date(monthStart), monthEnd);
        let todaySchedule = null;
        try {
            todaySchedule = await shift_timing_model_1.default.findCurrentShiftForUser(userId, new Date(today));
        }
        catch { }
        let exceptions = [];
        try {
            exceptions = await shift_exception_model_1.default.findByUserId(userId);
        }
        catch { }
        return res.json({
            success: true,
            data: {
                branchInfo: settings,
                assignedLocations: locRows,
                todayAttendance: todayAttendance || null,
                monthAttendance,
                todaySchedule,
                shiftExceptions: exceptions,
                serverTime: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Dashboard data sync error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.get('/attendance-changes', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.currentUser?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const since = req.query.since;
        if (!since) {
            return res.status(400).json({ success: false, message: 'since query parameter is required (ISO timestamp)' });
        }
        const sinceDate = new Date(since);
        if (isNaN(sinceDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid since timestamp' });
        }
        const records = await attendance_model_1.default.findByUpdatedSince(userId, sinceDate);
        return res.json({
            success: true,
            data: { attendance: records, serverTime: new Date().toISOString() }
        });
    }
    catch (error) {
        console.error('Attendance changes sync error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=sync.route.js.map