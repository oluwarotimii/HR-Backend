import { Router } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import AttendanceModel from '../models/attendance.model';
import ShiftTimingModel from '../models/shift-timing.model';
import HolidayModel from '../models/holiday.model';
import LeaveHistoryModel from '../models/leave-history.model';
import AttendanceProcessorWorker from '../workers/attendance-processor.worker';
import attendanceProcessRoutes from './attendance-process.route';
import attendanceSettingsRoutes from './attendance-settings.route';
import attendanceCheckRoutes from './attendance-check.route';
import { pool } from '../config/database';
const router = Router();
router.get('/history/user/:userId', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const userIdParam = req.params.userId;
        const userIdStr = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
        const userId = parseInt(userIdStr);
        const currentUserId = req.currentUser?.id;
        const currentUserRole = req.currentUser?.role_id;
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        if (currentUserId !== userId && currentUserRole !== 1 && currentUserRole !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Cannot access other users\' attendance records'
            });
        }
        const attendanceRecords = await AttendanceModel.findByUserId(userId);
        return res.json({
            success: true,
            message: 'Attendance history retrieved successfully',
            data: { attendance: attendanceRecords }
        });
    }
    catch (error) {
        console.error('Get attendance history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const { userId, date, startDate, endDate, status } = req.query;
        const currentUserId = req.currentUser?.id;
        const currentUserRole = req.currentUser?.role_id;
        let targetUserId = currentUserId;
        if (currentUserRole === 1 || currentUserRole === 3) {
            const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
            targetUserId = userId ? parseInt(userIdStr) : currentUserId;
        }
        else if (userId) {
            const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
            if (parseInt(userIdStr) !== currentUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot view other users\' attendance records'
                });
            }
        }
        let attendanceRecords;
        if (date) {
            const singleAttendance = await AttendanceModel.findByUserIdAndDate(targetUserId, new Date(date));
            attendanceRecords = singleAttendance ? [singleAttendance] : [];
        }
        else if (startDate && endDate) {
            attendanceRecords = await AttendanceModel.findByDateRange(targetUserId, new Date(startDate), new Date(endDate));
        }
        else {
            attendanceRecords = await AttendanceModel.findByUserId(targetUserId);
        }
        if (status) {
            attendanceRecords = attendanceRecords.filter(record => record.status === status);
        }
        return res.json({
            success: true,
            message: 'Attendance records retrieved successfully',
            data: { attendance: attendanceRecords }
        });
    }
    catch (error) {
        console.error('Get attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/my', authenticateJWT, async (req, res) => {
    try {
        const { date, startDate, endDate, status } = req.query;
        const currentUserId = req.currentUser?.id;
        let attendanceRecords;
        if (date) {
            const singleAttendance = await AttendanceModel.findByUserIdAndDate(currentUserId, new Date(date));
            attendanceRecords = singleAttendance ? [singleAttendance] : [];
        }
        else if (startDate && endDate) {
            attendanceRecords = await AttendanceModel.findByDateRange(currentUserId, new Date(startDate), new Date(endDate));
        }
        else {
            attendanceRecords = await AttendanceModel.findByUserId(currentUserId);
        }
        if (status) {
            attendanceRecords = attendanceRecords.filter(record => record.status === status);
        }
        return res.json({
            success: true,
            message: 'Your attendance records retrieved successfully',
            data: { attendance: attendanceRecords }
        });
    }
    catch (error) {
        console.error('Get my attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/summary', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;
        const currentUserId = req.currentUser?.id;
        const currentUserRole = req.currentUser?.role_id;
        let targetUserId = currentUserId;
        if (currentUserRole === 1 || currentUserRole === 3) {
            const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
            targetUserId = userId ? parseInt(userIdStr) : currentUserId;
        }
        else if (userId) {
            const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
            if (parseInt(userIdStr) !== currentUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot view other users\' attendance summary'
                });
            }
        }
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required for summary'
            });
        }
        const summary = await AttendanceModel.getAttendanceSummary(targetUserId, new Date(startDate), new Date(endDate));
        const percentage = await AttendanceModel.getAttendancePercentage(targetUserId, new Date(startDate), new Date(endDate));
        return res.json({
            success: true,
            message: 'Attendance summary retrieved successfully',
            data: {
                summary: {
                    ...summary,
                    attendance_percentage: percentage
                }
            }
        });
    }
    catch (error) {
        console.error('Get attendance summary error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/my/summary', authenticateJWT, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const currentUserId = req.currentUser?.id;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required for summary'
            });
        }
        const summary = await AttendanceModel.getAttendanceSummary(currentUserId, new Date(startDate), new Date(endDate));
        const percentage = await AttendanceModel.getAttendancePercentage(currentUserId, new Date(startDate), new Date(endDate));
        return res.json({
            success: true,
            message: 'Your attendance summary retrieved successfully',
            data: {
                summary: {
                    ...summary,
                    attendance_percentage: percentage
                }
            }
        });
    }
    catch (error) {
        console.error('Get my attendance summary error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/reports/monthly', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const { year, month, userId } = req.query;
        const currentUserId = req.currentUser?.id;
        const currentUserRole = req.currentUser?.role_id;
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required for monthly report'
            });
        }
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Valid year and month (1-12) are required'
            });
        }
        let targetUserId = currentUserId;
        if (currentUserRole === 1 || currentUserRole === 3) {
            const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
            targetUserId = userId ? parseInt(userIdStr) : currentUserId;
        }
        else if (userId) {
            const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
            if (parseInt(userIdStr) !== currentUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot view other users\' attendance reports'
                });
            }
        }
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0);
        const attendanceRecords = await AttendanceModel.findByDateRange(targetUserId, startDate, endDate);
        const monthlySummary = await AttendanceModel.getAttendanceSummary(targetUserId, startDate, endDate);
        const monthlyPercentage = await AttendanceModel.getAttendancePercentage(targetUserId, startDate, endDate);
        return res.json({
            success: true,
            message: 'Monthly attendance report generated successfully',
            data: {
                report: {
                    year: yearNum,
                    month: monthNum,
                    user_id: targetUserId,
                    attendance_records: attendanceRecords,
                    summary: {
                        ...monthlySummary,
                        attendance_percentage: monthlyPercentage
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('Get monthly attendance report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/records', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const { page, limit, userId, date, startDate, endDate, status } = req.query;
        const currentPage = parseInt(page) || 1;
        const perPage = parseInt(limit) || 20;
        const offset = (currentPage - 1) * perPage;
        let query = `SELECT a.*, u.full_name, s.employee_id
                 FROM attendance a
                 LEFT JOIN staff s ON a.user_id = s.user_id
                 LEFT JOIN users u ON a.user_id = u.id
                 WHERE 1=1`;
        const params = [];
        if (userId) {
            const userIdNum = parseInt(userId);
            if (!isNaN(userIdNum)) {
                query += ' AND a.user_id = ?';
                params.push(userIdNum);
            }
        }
        if (date) {
            query += ' AND DATE(a.date) = ?';
            params.push(date);
        }
        else if (startDate && endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }
        query += ' ORDER BY a.date DESC, a.created_at DESC LIMIT ? OFFSET ?';
        params.push(perPage, offset);
        console.log('Attendance records query:', query);
        console.log('Params:', params);
        let countQuery = `SELECT COUNT(*) as total FROM attendance a WHERE 1=1`;
        const countParams = [];
        if (userId) {
            const userIdNum = parseInt(userId);
            if (!isNaN(userIdNum)) {
                countQuery += ' AND a.user_id = ?';
                countParams.push(userIdNum);
            }
        }
        if (date) {
            countQuery += ' AND DATE(a.date) = ?';
            countParams.push(date);
        }
        else if (startDate && endDate) {
            countQuery += ' AND a.date BETWEEN ? AND ?';
            countParams.push(startDate, endDate);
        }
        if (status) {
            countQuery += ' AND a.status = ?';
            countParams.push(status);
        }
        const [countResult] = await pool.execute(countQuery, countParams);
        const totalRecords = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalRecords / perPage);
        const [rows] = await pool.execute(query, params);
        return res.json({
            success: true,
            message: 'Attendance records retrieved successfully',
            data: {
                attendance: rows,
                pagination: {
                    current_page: currentPage,
                    per_page: perPage,
                    total_records: totalRecords,
                    total_pages: totalPages
                }
            }
        });
    }
    catch (error) {
        console.error('Get attendance records error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sql: error.sql,
            sqlMessage: error.sqlMessage
        });
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});
router.get('/staff-data', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const { startDate, endDate, branchId, departmentId } = req.query;
        let query = `
      SELECT
        s.id,
        s.user_id,
        u.full_name,
        s.employee_id,
        d.name as department,
        b.name as branch,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
        COUNT(CASE WHEN a.status = 'early' THEN 1 END) as early_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN a.status = 'leave' THEN 1 END) as leave_count,
        COUNT(CASE WHEN a.status = 'holiday' THEN 1 END) as holiday_count
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN attendance a ON s.user_id = a.user_id
      WHERE s.status = 'active' AND u.status = 'active'
    `;
        const params = [];
        if (branchId) {
            query += ' AND s.branch_id = ?';
            params.push(branchId);
        }
        if (departmentId) {
            query += ' AND s.department_id = ?';
            params.push(departmentId);
        }
        if (startDate && endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        query += `
      GROUP BY s.id, s.user_id, u.full_name, s.employee_id, d.name, b.name
      ORDER BY u.full_name
    `;
        const [results] = await pool.execute(query, params);
        return res.json({
            success: true,
            message: 'Staff attendance data retrieved successfully',
            data: { staff: results, staffAttendanceData: results }
        });
    }
    catch (error) {
        console.error('Get staff attendance data error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/monthly-stats', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const [rows] = await pool.execute(`SELECT
          COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
          COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
          COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
          COUNT(CASE WHEN status = 'leave' THEN 1 END) as leaves
         FROM attendance
         WHERE date BETWEEN ? AND ?`, [startDate, endDate]);
            const monthName = date.toLocaleString('default', { month: 'short' });
            months.push({
                month: `${monthName} ${date.getFullYear()}`,
                ...(rows[0] || { present: 0, absent: 0, late: 0, leaves: 0 })
            });
        }
        return res.json({
            success: true,
            message: 'Monthly attendance statistics retrieved successfully',
            data: { monthlyStats: months }
        });
    }
    catch (error) {
        console.error('Get monthly stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.delete('/:id', authenticateJWT, checkPermission('attendance:delete'), async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const attendanceId = parseInt(idStr);
        if (isNaN(attendanceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance ID'
            });
        }
        const existingAttendance = await AttendanceModel.findById(attendanceId);
        if (!existingAttendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        await AttendanceModel.delete(attendanceId);
        return res.json({
            success: true,
            message: 'Attendance record deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/:id', authenticateJWT, checkPermission('attendance:update'), async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const attendanceId = parseInt(idStr);
        const { status, check_in_time, check_out_time, location_verified } = req.body;
        if (isNaN(attendanceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance ID'
            });
        }
        const existingAttendance = await AttendanceModel.findById(attendanceId);
        if (!existingAttendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        const updateData = {};
        if (status !== undefined)
            updateData.status = status;
        if (check_in_time !== undefined)
            updateData.check_in_time = check_in_time;
        if (check_out_time !== undefined)
            updateData.check_out_time = check_out_time;
        if (location_verified !== undefined)
            updateData.location_verified = location_verified;
        const updatedAttendance = await AttendanceModel.update(attendanceId, updateData);
        return res.json({
            success: true,
            message: 'Attendance record updated successfully',
            data: { attendance: updatedAttendance }
        });
    }
    catch (error) {
        console.error('Update attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:id', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const attendanceId = parseInt(idStr);
        if (isNaN(attendanceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance ID'
            });
        }
        const attendanceRecord = await AttendanceModel.findById(attendanceId);
        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        const currentUserId = req.currentUser?.id;
        const currentUserRole = req.currentUser?.role_id;
        if (attendanceRecord.user_id !== currentUserId && currentUserRole !== 1 && currentUserRole !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Cannot access other users\' attendance records'
            });
        }
        return res.json({
            success: true,
            message: 'Attendance record retrieved successfully',
            data: { attendance: attendanceRecord }
        });
    }
    catch (error) {
        console.error('Get attendance by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/records/:id', authenticateJWT, checkPermission('attendance:read'), async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const attendanceId = parseInt(idStr);
        if (isNaN(attendanceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance ID'
            });
        }
        const attendanceRecord = await AttendanceModel.findById(attendanceId);
        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        const currentUserId = req.currentUser?.id;
        const currentUserRole = req.currentUser?.role_id;
        if (attendanceRecord.user_id !== currentUserId && currentUserRole !== 1 && currentUserRole !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Cannot access other users\' attendance records'
            });
        }
        return res.json({
            success: true,
            message: 'Attendance record retrieved successfully',
            data: { attendance: attendanceRecord }
        });
    }
    catch (error) {
        console.error('Get attendance record by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/my/:id', authenticateJWT, async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const attendanceId = parseInt(idStr);
        if (isNaN(attendanceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance ID'
            });
        }
        const attendanceRecord = await AttendanceModel.findById(attendanceId);
        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        const currentUserId = req.currentUser?.id;
        if (attendanceRecord.user_id !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'Cannot access other users\' attendance records'
            });
        }
        return res.json({
            success: true,
            message: 'Your attendance record retrieved successfully',
            data: { attendance: attendanceRecord }
        });
    }
    catch (error) {
        console.error('Get my attendance by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/holidays', authenticateJWT, checkPermission('attendance:view'), async (req, res) => {
    try {
        const { branchId, date, startDate, endDate } = req.query;
        let holidays;
        if (startDate && endDate) {
            const startDateStr = Array.isArray(startDate) ? startDate[0] : startDate;
            const endDateStr = Array.isArray(endDate) ? endDate[0] : endDate;
            if (typeof startDateStr !== 'string' || typeof endDateStr !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate must be valid date strings'
                });
            }
            const branchIdStr = Array.isArray(branchId) ? branchId[0] : branchId;
            const branchIdNum = branchIdStr ? parseInt(branchIdStr) : undefined;
            holidays = await HolidayModel.getHolidaysInRange(new Date(startDateStr), new Date(endDateStr), branchIdNum);
        }
        else if (branchId) {
            const branchIdStr = Array.isArray(branchId) ? branchId[0] : branchId;
            const branchIdNum = parseInt(branchIdStr);
            if (isNaN(branchIdNum)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid branch ID'
                });
            }
            holidays = await HolidayModel.findByBranch(branchIdNum);
        }
        else if (date) {
            const dateStr = Array.isArray(date) ? date[0] : date;
            if (typeof dateStr !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'date must be a valid date string'
                });
            }
            holidays = await HolidayModel.findByDate(new Date(dateStr));
        }
        else {
            holidays = await HolidayModel.findAll();
        }
        return res.json({
            success: true,
            message: 'Holidays retrieved successfully',
            data: { holidays }
        });
    }
    catch (error) {
        console.error('Get holidays error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/holidays/:id', authenticateJWT, checkPermission('attendance:view'), async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const holidayId = parseInt(idStr);
        if (isNaN(holidayId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid holiday ID'
            });
        }
        const holiday = await HolidayModel.findById(holidayId);
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }
        return res.json({
            success: true,
            message: 'Holiday retrieved successfully',
            data: { holiday }
        });
    }
    catch (error) {
        console.error('Get holiday error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/process-daily', authenticateJWT, checkPermission('attendance:manage'), async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        const [staffResults] = await pool.execute(`SELECT s.user_id FROM staff s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.status = 'active' AND u.status = 'active'`);
        const userIds = staffResults.map((staff) => staff.user_id);
        const isHoliday = await HolidayModel.isHoliday(new Date(date));
        if (isHoliday) {
            const results = [];
            for (const userId of userIds) {
                const existingAttendance = await AttendanceModel.findByUserIdAndDate(userId, new Date(date));
                if (existingAttendance) {
                    results.push({
                        user_id: userId,
                        status: 'skipped',
                        message: 'Attendance already exists for this date'
                    });
                    continue;
                }
                const attendanceData = {
                    user_id: userId,
                    date: new Date(date),
                    status: 'holiday',
                    check_in_time: null,
                    check_out_time: null,
                    location_coordinates: null,
                    location_verified: false,
                    location_address: null,
                    notes: 'Public holiday - no attendance required'
                };
                const newAttendance = await AttendanceModel.create(attendanceData);
                results.push({
                    user_id: userId,
                    status: 'success',
                    attendance: newAttendance
                });
            }
            return res.status(201).json({
                success: true,
                message: 'Holiday attendance processed for all active staff',
                data: { results }
            });
        }
        const results = [];
        for (const userId of userIds) {
            const existingAttendance = await AttendanceModel.findByUserIdAndDate(userId, new Date(date));
            if (existingAttendance) {
                results.push({
                    user_id: userId,
                    status: 'skipped',
                    message: 'Attendance already exists for this date'
                });
                continue;
            }
            const leaveHistory = await LeaveHistoryModel.findByUserIdAndDateRange(userId, new Date(date), new Date(date));
            if (leaveHistory.length > 0) {
                const attendanceData = {
                    user_id: userId,
                    date: new Date(date),
                    status: 'leave',
                    check_in_time: null,
                    check_out_time: null,
                    location_coordinates: null,
                    location_verified: false,
                    location_address: null,
                    notes: 'On approved leave'
                };
                const newAttendance = await AttendanceModel.create(attendanceData);
                results.push({
                    user_id: userId,
                    status: 'success',
                    attendance: newAttendance
                });
                continue;
            }
            const shift = await ShiftTimingModel.findCurrentShiftForUser(userId, new Date(date));
            if (!shift) {
                results.push({
                    user_id: userId,
                    status: 'skipped',
                    message: 'No shift assigned for this date'
                });
                continue;
            }
            const attendanceData = {
                user_id: userId,
                date: new Date(date),
                status: 'absent',
                check_in_time: null,
                check_out_time: null,
                location_coordinates: null,
                location_verified: false,
                location_address: null,
                notes: 'Scheduled shift but no check-in recorded'
            };
            const newAttendance = await AttendanceModel.create(attendanceData);
            results.push({
                user_id: userId,
                status: 'success',
                attendance: newAttendance
            });
        }
        return res.status(201).json({
            success: true,
            message: 'Daily attendance processing completed for all active staff',
            data: { results }
        });
    }
    catch (error) {
        console.error('Process daily attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/process-range', authenticateJWT, checkPermission('attendance:manage'), async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required'
            });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates = [];
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        let totalProcessed = 0;
        const results = [];
        for (const date of dates) {
            try {
                await AttendanceProcessorWorker.processAttendanceForDate(date);
                totalProcessed++;
                results.push({
                    date: date.toISOString().split('T')[0],
                    success: true
                });
            }
            catch (error) {
                results.push({
                    date: date.toISOString().split('T')[0],
                    success: false,
                    error: error.message
                });
            }
        }
        return res.json({
            success: true,
            message: `Processed attendance for ${totalProcessed} days`,
            data: {
                daysProcessed: totalProcessed,
                dateRange: { startDate, endDate },
                results
            }
        });
    }
    catch (error) {
        console.error('Process range error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to process attendance'
        });
    }
});
router.use('/process', attendanceProcessRoutes);
router.use('/settings', attendanceSettingsRoutes);
router.use(attendanceCheckRoutes);
export default router;
//# sourceMappingURL=attendance.route.js.map