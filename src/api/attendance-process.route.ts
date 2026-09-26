import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import AttendanceModel from '../models/attendance.model';
import AttendanceProcessorWorker from '../workers/attendance-processor.worker';

const router = Router();

// POST /api/attendance/process - Process attendance for a specific date considering all factors
router.post('/process', authenticateJWT, checkPermission('attendance:manage'), async (req: Request, res: Response) => {
  try {
    const { date, userId } = req.body;
    const currentUserId = req.currentUser?.id;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Validate user ID if provided
    let targetUserId = currentUserId;
    if (userId) {
      // Only admins/Hr can process attendance for other users
      const currentUserRole = req.currentUser?.role_id;
      if (currentUserRole !== 1 && currentUserRole !== 3) { // Assuming admin/HR roles
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to process attendance for other users'
        });
      }
      targetUserId = userId;
    }

    const outcome = await AttendanceProcessorWorker.processAttendanceForUser(targetUserId!, new Date(date));

    if (outcome === 'skipped') {
      return res.status(409).json({
        success: false,
        message: 'Attendance already processed for this date'
      });
    }

    const newAttendance = await AttendanceModel.findByUserIdAndDate(targetUserId!, new Date(date));

    return res.status(201).json({
      success: true,
      message: `Attendance processed successfully (${outcome})`,
      data: { attendance: newAttendance }
    });
  } catch (error) {
    console.error('Process attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/attendance/process-batch - Process attendance for multiple users for a specific date
router.post('/process-batch', authenticateJWT, checkPermission('attendance:manage'), async (req: Request, res: Response) => {
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
      const outcome = await AttendanceProcessorWorker.processAttendanceForUser(userId, new Date(date));
      if (outcome === 'skipped') {
        results.push({
          user_id: userId,
          status: 'skipped',
          message: 'Attendance already exists for this date'
        });
        continue;
      }
      const newAttendance = await AttendanceModel.findByUserIdAndDate(userId, new Date(date));
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
  } catch (error) {
    console.error('Batch process attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
