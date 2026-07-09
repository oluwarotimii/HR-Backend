"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
router.get('/full', auth_middleware_1.authenticateJWT, async (req, res) => {
    const clientTimestamp = req.query.clientTimestamp;
    try {
        const userId = req.currentUser?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const [userRows] = await database_1.pool.execute(`SELECT id, full_name, email, phone, role_id, status, created_at, updated_at FROM users WHERE id = ?`, [userId]);
        const [staffRows] = await database_1.pool.execute(`SELECT s.*, d.name AS department_name, b.name AS branch_name
       FROM staff s
       LEFT JOIN departments d ON d.id = s.department_id
       LEFT JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = ?`, [userId]);
        const [permRows] = await database_1.pool.execute(`SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN users u ON rp.role_id = u.role_id
       WHERE u.id = ?`, [userId]);
        const staffBranchId = staffRows[0]?.branch_id;
        let branchInfo = null;
        let branchWorkingDays = [];
        if (staffBranchId) {
            const [bRows] = await database_1.pool.execute(`SELECT * FROM branches WHERE id = ?`, [staffBranchId]);
            branchInfo = bRows[0] || null;
            const [wdRows] = await database_1.pool.execute(`SELECT * FROM branch_working_days WHERE branch_id = ?`, [staffBranchId]);
            branchWorkingDays = wdRows;
        }
        const [locRows] = await database_1.pool.execute(`SELECT al.*, TRUE AS is_primary, TRUE AS assignment_active
       FROM staff_location_assignments sla
       JOIN attendance_locations al ON sla.assigned_location_id = al.id
       WHERE sla.user_id = ? AND al.is_active = 1`, [userId]);
        const [attRows] = await database_1.pool.execute(`SELECT id, user_id, date, status, check_in_time, check_out_time,
              ST_AsText(location_coordinates) AS location_coordinates,
              location_verified, location_address, notes, is_locked,
              scheduled_start_time, scheduled_end_time, scheduled_break_duration_minutes,
              is_late, is_early_departure, actual_working_hours,
              created_at, updated_at
       FROM attendance
       WHERE user_id = ? AND date >= ?`, [userId, ninetyDaysAgo]);
        const [shiftRows] = await database_1.pool.execute(`SELECT st.*, bwd.start_time, bwd.end_time, bwd.break_duration_minutes, bwd.is_working_day
       FROM shift_timings st
       LEFT JOIN branch_working_days bwd ON bwd.branch_id = st.override_branch_id AND bwd.day_of_week = WEEKDAY(?) + 1
       WHERE st.user_id = ? AND st.effective_from <= ? AND (st.effective_to IS NULL OR st.effective_to >= ?)
       ORDER BY st.id DESC LIMIT 1`, [todayStr, userId, todayStr, todayStr]);
        const [excRows] = await database_1.pool.execute(`SELECT * FROM shift_exceptions WHERE user_id = ? AND status = 'active' AND exception_date >= ?`, [userId, ninetyDaysAgo]);
        const [holRows] = await database_1.pool.execute(`SELECT * FROM holidays WHERE date >= ?`, [ninetyDaysAgo]);
        const [leaveRows] = await database_1.pool.execute(`SELECT lt.name AS leave_type, la.allocated_days, la.used_days, la.carried_over_days,
              (la.allocated_days + la.carried_over_days - la.used_days) AS remaining_days
       FROM leave_allocations la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.user_id = ? AND (la.expiry_date IS NULL OR la.expiry_date >= ?)`, [userId, todayStr]);
        const [deptRows] = await database_1.pool.execute(`SELECT id, name FROM departments WHERE status = 'active'`);
        const [branchRows] = await database_1.pool.execute(`SELECT id, name, code, address, attendance_mode, check_in_start, check_in_end, grace_minutes,
              late_threshold_minutes, timezone, status FROM branches WHERE status = 'active'`);
        let settings = null;
        if (staffBranchId) {
            const [sRows] = await database_1.pool.execute(`SELECT * FROM attendance_settings WHERE branch_id = ?`, [staffBranchId]);
            settings = sRows[0] || null;
        }
        const response = {
            success: true,
            data: {
                serverTime: today.toISOString(),
                user: userRows[0] || null,
                staff: staffRows[0] || null,
                permissions: permRows.map((p) => p.name),
                branchInfo,
                branchWorkingDays,
                assignedLocations: locRows,
                attendance: attRows,
                todayShift: shiftRows[0] || null,
                shiftExceptions: excRows,
                holidays: holRows,
                leaveBalance: leaveRows,
                departments: deptRows,
                branches: branchRows,
                attendanceSettings: settings,
            }
        };
        if (clientTimestamp) {
            const since = new Date(clientTimestamp);
            if (!isNaN(since.getTime())) {
                response.data.attendance = attRows.filter((a) => new Date(a.updated_at).getTime() > since.getTime());
            }
        }
        return res.json(response);
    }
    catch (error) {
        console.error('Full sync error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=sync-full.route.js.map