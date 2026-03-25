import { Router } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import AttendanceModel from '../models/attendance.model';
import ShiftTimingModel from '../models/shift-timing.model';
import HolidayModel from '../models/holiday.model';
import LeaveHistoryModel from '../models/leave-history.model';
const router = Router();
router.post('/process', authenticateJWT, checkPermission('attendance:manage'), async (req, res) => {
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
        const existingAttendance = await AttendanceModel.findByUserIdAndDate(targetUserId, new Date(date));
        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: 'Attendance already processed for this date'
            });
        }
        const isHoliday = await HolidayModel.isHoliday(new Date(date));
        if (isHoliday) {
            const attendanceData = {
                user_id: targetUserId,
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
            return res.status(201).json({
                success: true,
                message: 'Holiday attendance processed successfully',
                data: { attendance: newAttendance }
            });
        }
        const leaveHistory = await LeaveHistoryModel.findByUserIdAndDateRange(targetUserId, new Date(date), new Date(date));
        if (leaveHistory.length > 0) {
            const attendanceData = {
                user_id: targetUserId,
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
            return res.status(201).json({
                success: true,
                message: 'Leave attendance processed successfully',
                data: { attendance: newAttendance }
            });
        }
        const shift = await ShiftTimingModel.findCurrentShiftForUser(targetUserId, new Date(date));
        if (!shift) {
            const attendanceData = {
                user_id: targetUserId,
                date: new Date(date),
                status: 'absent',
                check_in_time: null,
                check_out_time: null,
                location_coordinates: null,
                location_verified: false,
                location_address: null,
                notes: 'No shift assigned for this date'
            };
            const newAttendance = await AttendanceModel.create(attendanceData);
            return res.status(201).json({
                success: true,
                message: 'Absence recorded (no shift assigned)',
                data: { attendance: newAttendance }
            });
        }
        const attendanceData = {
            user_id: targetUserId,
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
        return res.status(201).json({
            success: true,
            message: 'Absence recorded (shift scheduled but no check-in)',
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
router.post('/process-batch', authenticateJWT, checkPermission('attendance:manage'), async (req, res) => {
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
                message: 'Holiday attendance processed for all users',
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
                const attendanceData = {
                    user_id: userId,
                    date: new Date(date),
                    status: 'absent',
                    check_in_time: null,
                    check_out_time: null,
                    location_coordinates: null,
                    location_verified: false,
                    location_address: null,
                    notes: 'No shift assigned for this date'
                };
                const newAttendance = await AttendanceModel.create(attendanceData);
                results.push({
                    user_id: userId,
                    status: 'success',
                    attendance: newAttendance
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
export default router;
//# sourceMappingURL=attendance-process.route.js.map