import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import AttendanceModel from '../models/attendance.model';
import ShiftTimingModel from '../models/shift-timing.model';
import HolidayModel from '../models/holiday.model';
import AttendanceLocationModel from '../models/attendance-location.model';
import BranchModel from '../models/branch.model';
import StaffModel from '../models/staff.model';

const router = Router();

// POST /api/attendance - Mark attendance (with location verification)
router.post('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { date, check_in_time, check_out_time, location_coordinates, location_address } = req.body;
    const userId = req.currentUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user information'
      });
    }

    // Validate required fields
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Check if user has already marked attendance for this date
    const existingAttendance = await AttendanceModel.findByUserIdAndDate(userId, new Date(date));
    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already marked for this date'
      });
    }

    // Check if it's a holiday
    const isHoliday = await HolidayModel.isHoliday(new Date(date));
    if (isHoliday) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark attendance on a holiday'
      });
    }

    // Get user's branch to determine attendance mode
    const staffRecord = await StaffModel.findByUserId(userId);
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

    let locationVerified = false;
    let status: 'present' | 'absent' | 'late' | 'half_day' | 'leave' | 'holiday' = 'absent';

    // Handle location verification based on attendance mode
    if (branch.attendance_mode === 'branch_based' && location_coordinates) {
      // Verify user is at their assigned branch
      if (branch.location_coordinates) {
        const branchCoords = branch.location_coordinates.match(/POINT\(([-+]?\d*\.\d+) ([-+]?\d*\.\d+)\)/);
        if (branchCoords) {
          const branchLng = parseFloat(branchCoords[1]);
          const branchLat = parseFloat(branchCoords[2]);

          const userCoords = location_coordinates.match(/POINT\(([-+]?\d*\.\d+) ([-+]?\d*\.\d+)\)/);
          if (userCoords) {
            const userLng = parseFloat(userCoords[1]);
            const userLat = parseFloat(userCoords[2]);

            // Calculate distance between user and branch (simplified)
            const distance = Math.sqrt(Math.pow(userLng - branchLng, 2) + Math.pow(userLat - branchLat, 2)) * 111000; // Approximate km to meters
            const radius = branch.location_radius_meters || 100;

            if (distance <= radius) {
              locationVerified = true;
            }
          }
        }
      }
    } else if (branch.attendance_mode === 'multiple_locations' && location_coordinates) {
      // Verify user is at one of the approved locations
      const nearbyLocations = await AttendanceLocationModel.getLocationsNearby(
        parseFloat(location_coordinates.latitude),
        parseFloat(location_coordinates.longitude),
        branch.location_radius_meters || 100
      );

      if (nearbyLocations.length > 0) {
        locationVerified = true;
      }
    }

    // Determine status based on check-in time vs shift time
    const shift = await ShiftTimingModel.findCurrentShiftForUser(userId, new Date(date));
    if (shift && check_in_time) {
      const shiftStartTime = new Date(`1970-01-01T${shift.start_time}`);
      const checkInTime = new Date(`1970-01-01T${check_in_time}`);

      if (checkInTime.getTime() > shiftStartTime.getTime()) {
        status = 'late';
      } else {
        status = 'present';
      }
    } else if (check_in_time) {
      status = 'present';
    }

    // Create attendance record
    const attendanceData = {
      user_id: userId,
      date: new Date(date),
      status,
      check_in_time: check_in_time ? new Date(`1970-01-01T${check_in_time}`) : null,
      check_out_time: check_out_time ? new Date(`1970-01-01T${check_out_time}`) : null,
      location_coordinates: location_coordinates ?
        `POINT(${location_coordinates.longitude} ${location_coordinates.latitude})` : null,
      location_verified: locationVerified,
      location_address: location_address || null,
      notes: null
    };

    const newAttendance = await AttendanceModel.create(attendanceData);

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: { attendance: newAttendance }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/attendance - Get attendance records
router.get('/', authenticateJWT, checkPermission('attendance:read'), async (req: Request, res: Response) => {
  try {
    const { userId, date, startDate, endDate, status } = req.query;
    const currentUserId = req.currentUser?.id;
    const currentUserRole = req.currentUser?.role_id;

    // Regular users can only view their own attendance
    // Admins and managers can view others' attendance
    let targetUserId = currentUserId;
    if (currentUserRole === 1 || currentUserRole === 3) { // Assuming admin/HR roles
      const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
      targetUserId = userId ? parseInt(userIdStr as string) : currentUserId;
    } else if (userId) {
      const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
      if (parseInt(userIdStr as string) !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Cannot view other users\' attendance records'
        });
      }
    }

    let attendanceRecords: any[];

    if (date) {
      // Get attendance for specific date
      const singleAttendance = await AttendanceModel.findByUserIdAndDate(targetUserId!, new Date(date as string));
      attendanceRecords = singleAttendance ? [singleAttendance] : [];
    } else if (startDate && endDate) {
      // Get attendance for date range
      attendanceRecords = await AttendanceModel.findByDateRange(targetUserId!, new Date(startDate as string), new Date(endDate as string));
    } else {
      // Get all attendance for user
      attendanceRecords = await AttendanceModel.findByUserId(targetUserId!);
    }

    // Filter by status if provided
    if (status) {
      attendanceRecords = attendanceRecords.filter(record => record.status === status);
    }

    return res.json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: { attendance: attendanceRecords }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/attendance/summary - Get attendance summary
router.get('/summary', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const currentUserId = req.currentUser?.id;
    const currentUserRole = req.currentUser?.role_id;

    // Determine whose attendance to summarize
    let targetUserId = currentUserId;
    if (currentUserRole === 1 || currentUserRole === 3) { // Admin/HR
      const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
      targetUserId = userId ? parseInt(userIdStr as string) : currentUserId;
    } else if (userId) {
      const userIdStr = Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : '';
      if (parseInt(userIdStr as string) !== currentUserId) {
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

    const summary = await AttendanceModel.getAttendanceSummary(
      targetUserId!,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    const percentage = await AttendanceModel.getAttendancePercentage(
      targetUserId!,
      new Date(startDate as string),
      new Date(endDate as string)
    );

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
  } catch (error) {
    console.error('Get attendance summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/attendance/:id - Update attendance record (admin only)
router.put('/:id', authenticateJWT, checkPermission('attendance:update'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const attendanceId = parseInt(idStr as string);
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

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (check_in_time !== undefined) updateData.check_in_time = check_in_time;
    if (check_out_time !== undefined) updateData.check_out_time = check_out_time;
    if (location_verified !== undefined) updateData.location_verified = location_verified;

    const updatedAttendance = await AttendanceModel.update(attendanceId, updateData);

    return res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: { attendance: updatedAttendance }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;