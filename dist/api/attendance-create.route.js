import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import AttendanceModel from '../models/attendance.model';
import ShiftTimingModel from '../models/shift-timing.model';
import { ShiftSchedulingService } from '../services/shift-scheduling.service';
import HolidayModel from '../models/holiday.model';
import AttendanceLocationModel from '../models/attendance-location.model';
import BranchModel from '../models/branch.model';
import StaffModel from '../models/staff.model';
import { pool } from '../config/database';
const router = Router();
router.post('/manual', authenticateJWT, async (req, res) => {
    try {
        const { date, check_in_time, check_out_time, status, location_coordinates, location_address } = req.body;
        const userId = req.currentUser?.id;
        const requestingUserId = req.body.user_id || userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No user information'
            });
        }
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        const existingAttendance = await AttendanceModel.findByUserIdAndDate(requestingUserId, new Date(date));
        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: 'Attendance already marked for this date'
            });
        }
        const isHoliday = await HolidayModel.isHoliday(new Date(date));
        if (isHoliday) {
            const attendanceData = {
                user_id: requestingUserId,
                date: new Date(date),
                status: 'holiday',
                check_in_time: null,
                check_out_time: null,
                location_coordinates: null,
                location_verified: false,
                location_address: null,
                notes: 'Holiday - no attendance required'
            };
            const newAttendance = await AttendanceModel.create(attendanceData);
            return res.status(201).json({
                success: true,
                message: 'Holiday attendance recorded successfully',
                data: { attendance: newAttendance }
            });
        }
        const [leaveHistoryRows] = await pool.execute(`SELECT id, start_date, end_date FROM leave_history WHERE user_id = ? AND ? BETWEEN start_date AND end_date`, [requestingUserId, new Date(date)]);
        if (leaveHistoryRows.length > 0) {
            const attendanceData = {
                user_id: requestingUserId,
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
                message: 'Leave attendance recorded successfully',
                data: { attendance: newAttendance }
            });
        }
        const staffRecord = await StaffModel.findByUserId(requestingUserId);
        if (!staffRecord) {
            return res.status(404).json({
                success: false,
                message: 'Staff record not found for user'
            });
        }
        const branchId = staffRecord.branch_id;
        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: 'Staff record does not have a branch assigned'
            });
        }
        const branch = await BranchModel.findById(branchId);
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found for staff'
            });
        }
        let gracePeriodMinutes = 0;
        try {
            const [branchSettings] = await pool.execute(`SELECT * FROM attendance_settings WHERE branch_id = ?`, [branchId]);
            if (branchSettings && branchSettings.length > 0) {
                gracePeriodMinutes = branchSettings[0].grace_period_minutes || 0;
            }
        }
        catch (error) {
            console.log('Using default attendance settings (table may not exist)');
        }
        let locationVerified = false;
        let attendanceStatus = status || 'absent';
        if (branch.attendance_mode === 'branch_based' && location_coordinates) {
            if (branch.location_coordinates) {
                const branchCoords = branch.location_coordinates.match(/POINT\(([-+]?\d*\.\d+) ([-+]?\d*\.\d+)\)/);
                if (branchCoords) {
                    const branchLng = parseFloat(branchCoords[1]);
                    const branchLat = parseFloat(branchCoords[2]);
                    const userCoords = location_coordinates.match(/POINT\(([-+]?\d*\.\d+) ([-+]?\d*\.\d+)\)/);
                    if (userCoords) {
                        const userLng = parseFloat(userCoords[1]);
                        const userLat = parseFloat(userCoords[2]);
                        const distance = Math.sqrt(Math.pow(userLng - branchLng, 2) + Math.pow(userLat - branchLat, 2)) * 111000;
                        const radius = branch.location_radius_meters || 100;
                        if (distance <= radius) {
                            locationVerified = true;
                        }
                    }
                }
            }
        }
        else if (branch.attendance_mode === 'multiple_locations' && location_coordinates) {
            const nearbyLocations = await AttendanceLocationModel.getLocationsNearby(parseFloat(location_coordinates.latitude), parseFloat(location_coordinates.longitude), branch.location_radius_meters || 100);
            if (nearbyLocations.length > 0) {
                locationVerified = true;
            }
        }
        if (!status) {
            const shift = await ShiftTimingModel.findCurrentShiftForUser(requestingUserId, new Date(date));
            if (shift && check_in_time) {
                const shiftStartTime = new Date(`1970-01-01T${shift.start_time}`);
                const checkInTime = new Date(`1970-01-01T${check_in_time}`);
                if (checkInTime.getTime() > shiftStartTime.getTime()) {
                    attendanceStatus = 'late';
                }
                else {
                    attendanceStatus = 'present';
                }
            }
            else if (check_in_time) {
                attendanceStatus = 'present';
            }
        }
        const attendanceData = {
            user_id: requestingUserId,
            date: new Date(date),
            status: attendanceStatus,
            check_in_time: check_in_time ? new Date(`1970-01-01T${check_in_time}`) : null,
            check_out_time: check_out_time ? new Date(`1970-01-01T${check_out_time}`) : null,
            location_coordinates: location_coordinates ?
                `POINT(${location_coordinates.longitude} ${location_coordinates.latitude})` : null,
            location_verified: locationVerified,
            location_address: location_address || null,
            notes: null
        };
        const newAttendance = await AttendanceModel.create(attendanceData);
        try {
            await ShiftSchedulingService.updateAttendanceWithScheduleInfo(newAttendance.id, requestingUserId, new Date(date), gracePeriodMinutes);
        }
        catch (shiftError) {
            console.error('Failed to update attendance with shift info:', shiftError);
        }
        return res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: { attendance: newAttendance }
        });
    }
    catch (error) {
        console.error('Mark attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
export default router;
//# sourceMappingURL=attendance-create.route.js.map