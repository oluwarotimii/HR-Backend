import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import AttendanceModel from '../models/attendance.model';
import ShiftTimingModel from '../models/shift-timing.model';
import ShiftExceptionModel from '../models/shift-exception.model';
import AttendanceLocationModel from '../models/attendance-location.model';
import { pool } from '../config/database';

const router = Router();

// GET /api/sync/dashboard-data — all dashboard reference data in one call
router.get('/dashboard-data', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Branch info
    const [branchRows]: any[] = await pool.execute(
      `SELECT s.branch_id, b.name AS branch_name, b.location_coordinates,
              b.location_radius_meters, b.attendance_mode, b.status
       FROM staff s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = ?`,
      [userId]
    );
    const settings = branchRows[0] || null;

    // Assigned attendance locations
    const [locRows] = await pool.execute(
      `SELECT al.*, sla.is_primary, sla.is_active AS assignment_active
       FROM staff_location_assignments sla
       JOIN attendance_locations al ON sla.attendance_location_id = al.id
       WHERE sla.staff_user_id = ? AND sla.is_active = 1 AND al.is_active = 1`,
      [userId]
    );

    // Today's attendance
    const todayAttendance = await AttendanceModel.findByUserIdAndDate(userId, new Date(today));

    // Month attendance records
    const monthEnd = new Date();
    const monthAttendance = await AttendanceModel.findByDateRange(userId, new Date(monthStart), monthEnd);

    // Today's shift
    let todaySchedule = null;
    try { todaySchedule = await ShiftTimingModel.findCurrentShiftForUser(userId, new Date(today)); } catch {}

    // Shift exceptions
    let exceptions: any[] = [];
    try { exceptions = await ShiftExceptionModel.findByUserId(userId); } catch {}

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
  } catch (error) {
    console.error('Dashboard data sync error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/sync/attendance-changes — attendance records updated after a timestamp
router.get('/attendance-changes', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const since = req.query.since as string;
    if (!since) {
      return res.status(400).json({ success: false, message: 'since query parameter is required (ISO timestamp)' });
    }

    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid since timestamp' });
    }

    const records = await AttendanceModel.findByUpdatedSince(userId, sinceDate);

    return res.json({
      success: true,
      data: { attendance: records, serverTime: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Attendance changes sync error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
