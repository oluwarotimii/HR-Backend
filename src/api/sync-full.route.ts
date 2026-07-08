import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { pool } from '../config/database';

const router = Router();

// GET /api/sync/full — all reference data for full offline capability
router.get('/full', authenticateJWT, async (req: Request, res: Response) => {
  const clientTimestamp = req.query.clientTimestamp as string | undefined;

  try {
    const userId = req.currentUser?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

    // 1. User profile
    const [userRows]: any[] = await pool.execute(
      `SELECT id, full_name, email, phone, role_id, status, created_at, updated_at FROM users WHERE id = ?`, [userId]
    );

    // 2. Staff record
    const [staffRows]: any[] = await pool.execute(
      `SELECT s.*, d.name AS department_name, b.name AS branch_name
       FROM staff s
       LEFT JOIN departments d ON d.id = s.department_id
       LEFT JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = ?`, [userId]
    );

    // 3. Permissions
    const [permRows]: any[] = await pool.execute(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN users u ON rp.role_id = u.role_id
       WHERE u.id = ?`, [userId]
    );

    // 4. Branch info with working days
    const staffBranchId = staffRows[0]?.branch_id;
    let branchInfo = null;
    let branchWorkingDays: any[] = [];
    if (staffBranchId) {
      const [bRows]: any[] = await pool.execute(`SELECT * FROM branches WHERE id = ?`, [staffBranchId]);
      branchInfo = bRows[0] || null;
      const [wdRows]: any[] = await pool.execute(
        `SELECT * FROM branch_working_days WHERE branch_id = ?`, [staffBranchId]
      );
      branchWorkingDays = wdRows;
    }

    // 5. Assigned attendance locations
    const [locRows]: any[] = await pool.execute(
      `SELECT al.*, sla.is_primary, sla.is_active AS assignment_active
       FROM staff_location_assignments sla
       JOIN attendance_locations al ON sla.attendance_location_id = al.id
       WHERE sla.staff_user_id = ? AND sla.is_active = 1 AND al.is_active = 1`,
      [userId]
    );

    // 6. Attendance — last 90 days
    const [attRows]: any[] = await pool.execute(
      `SELECT id, user_id, date, status, check_in_time, check_out_time,
              ST_AsText(location_coordinates) AS location_coordinates,
              location_verified, location_address, notes, is_locked,
              scheduled_start_time, scheduled_end_time, scheduled_break_duration_minutes,
              is_late, is_early_departure, actual_working_hours,
              created_at, updated_at
       FROM attendance
       WHERE user_id = ? AND date >= ?`,
      [userId, ninetyDaysAgo]
    );

    // 7. Today's shift
    const [shiftRows]: any[] = await pool.execute(
      `SELECT st.*, bwd.start_time, bwd.end_time, bwd.break_duration_minutes, bwd.is_working_day
       FROM shift_timings st
       LEFT JOIN branch_working_days bwd ON bwd.branch_id = st.override_branch_id AND bwd.day_of_week = WEEKDAY(?) + 1
       WHERE st.user_id = ? AND st.effective_from <= ? AND (st.effective_to IS NULL OR st.effective_to >= ?)
       ORDER BY st.id DESC LIMIT 1`,
      [todayStr, userId, todayStr, todayStr]
    );

    // 8. Shift exceptions
    const [excRows]: any[] = await pool.execute(
      `SELECT * FROM shift_exceptions WHERE user_id = ? AND status = 'active' AND exception_date >= ?`,
      [userId, ninetyDaysAgo]
    );

    // 9. Holidays
    const [holRows]: any[] = await pool.execute(
      `SELECT * FROM holidays WHERE date >= ?`,
      [ninetyDaysAgo]
    );

    // 10. Leave balance
    const [leaveRows]: any[] = await pool.execute(
      `SELECT lt.name AS leave_type, la.allocated_days, la.used_days, la.carried_over_days,
              (la.allocated_days + la.carried_over_days - la.used_days) AS remaining_days
       FROM leave_allocations la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.user_id = ? AND (la.expiry_date IS NULL OR la.expiry_date >= ?)`,
      [userId, todayStr]
    );

    // 11. Reference data — departments
    const [deptRows]: any[] = await pool.execute(`SELECT id, name FROM departments WHERE status = 'active'`);

    // 12. Reference data — branches
    const [branchRows]: any[] = await pool.execute(
      `SELECT id, name, code, address, attendance_mode, check_in_start, check_in_end, grace_minutes,
              late_threshold_minutes, timezone, status FROM branches WHERE status = 'active'`
    );

    // 13. Attendance settings
    let settings = null;
    if (staffBranchId) {
      const [sRows]: any[] = await pool.execute(
        `SELECT * FROM attendance_settings WHERE branch_id = ?`, [staffBranchId]
      );
      settings = sRows[0] || null;
    }

    const response = {
      success: true,
      data: {
        serverTime: today.toISOString(),
        user: userRows[0] || null,
        staff: staffRows[0] || null,
        permissions: permRows.map((p: any) => p.name),
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

    // If client provided a timestamp, include only changed data
    if (clientTimestamp) {
      const since = new Date(clientTimestamp);
      if (!isNaN(since.getTime())) {
        // Filter attendance records updated after the client's timestamp
        (response.data as any).attendance = attRows.filter(
          (a: any) => new Date(a.updated_at).getTime() > since.getTime()
        );
      }
    }

    return res.json(response);
  } catch (error) {
    console.error('Full sync error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
