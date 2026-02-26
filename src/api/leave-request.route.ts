import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import LeaveRequestModel from '../models/leave-request.model';
import LeaveTypeModel from '../models/leave-type.model';
import LeaveAllocationModel from '../models/leave-allocation.model';
import { pool } from '../config/database';

const router = Router();

// GET /api/leave/requests - Get all leave requests (with filters)
router.get('/', authenticateJWT, checkPermission('leave:read'), async (req: Request, res: Response) => {
  try {
    const {
      userId,
      status,
      limit = 20,
      page = 1
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    // Get leave requests with filters
    const result = await LeaveRequestModel.findAll(
      userId ? parseInt(userId as string) : undefined,
      status as string,
      pageNum,
      limitNum
    );

    return res.json({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: {
        leaveRequests: result.data,
        pagination: {
          currentPage: pageNum,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/leave/my-requests - Get current user's own leave requests (no special permission needed)
router.get('/my-requests', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const {
      status,
      limit = 20,
      page = 1
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    const userId = req.currentUser?.id;

    // Get current user's leave requests
    const result = await LeaveRequestModel.findAll(
      userId,
      status as string,
      pageNum,
      limitNum
    );

    return res.json({
      success: true,
      message: 'Your leave requests retrieved successfully',
      data: {
        leaveRequests: result.data,
        pagination: {
          currentPage: pageNum,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get my leave requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/leave/balance - Get current user's leave balances by leave type (no special permission needed)
router.get('/balance', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    // Get all active leave types
    const leaveTypes = await LeaveTypeModel.findAll();

    // Get all allocations for this user
    const allocations = await LeaveAllocationModel.findByUserId(userId);

    // Get pending leave requests for this user
    const [pendingRequests]: any = await pool.execute(
      `SELECT leave_type_id, SUM(days_requested) as pending_days
       FROM leave_requests
       WHERE user_id = ? AND status IN ('submitted', 'pending')
       GROUP BY leave_type_id`,
      [userId]
    );

    const pendingMap = new Map<number, number>();
    pendingRequests.forEach((row: any) => {
      pendingMap.set(row.leave_type_id, parseFloat(row.pending_days));
    });

    // Calculate balance for each leave type
    const balances = leaveTypes.map((leaveType) => {
      // Find allocations for this leave type
      const typeAllocations = allocations.filter(
        (alloc) => alloc.leave_type_id === leaveType.id && new Date(alloc.cycle_end_date) >= new Date()
      );

      // Use the most recent allocation (first one since it's ordered by cycle_start_date DESC)
      const allocation = typeAllocations[0];
      const pendingDays = pendingMap.get(leaveType.id) || 0;

      if (allocation) {
        const remainingDays = allocation.allocated_days - allocation.used_days + allocation.carried_over_days - pendingDays;
        return {
          leave_type_id: leaveType.id,
          leave_type_name: leaveType.name,
          allocated_days: allocation.allocated_days,
          used_days: allocation.used_days,
          carried_over_days: allocation.carried_over_days,
          pending_days: pendingDays,
          remaining_days: remainingDays,
          cycle_start_date: allocation.cycle_start_date,
          cycle_end_date: allocation.cycle_end_date
        };
      } else {
        return {
          leave_type_id: leaveType.id,
          leave_type_name: leaveType.name,
          allocated_days: 0,
          used_days: 0,
          carried_over_days: 0,
          pending_days: pendingDays,
          remaining_days: -pendingDays,
          cycle_start_date: null,
          cycle_end_date: null
        };
      }
    });

    return res.json({
      success: true,
      message: 'Leave balances retrieved successfully',
      data: { balances }
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/leave/history - Get leave history (from leave_history table)
router.get('/history', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const {
      userId,
      year,
      status,
      limit = 50,
      page = 1
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = `SELECT lh.*, lt.name as leave_type_name, u.full_name as user_name
                 FROM leave_history lh
                 JOIN leave_types lt ON lh.leave_type_id = lt.id
                 JOIN users u ON lh.user_id = u.id
                 WHERE 1=1`;
    
    const params: any[] = [];

    if (userId) {
      query += ' AND lh.user_id = ?';
      params.push(parseInt(userId as string));
    }

    if (year) {
      query += ' AND YEAR(lh.start_date) = ?';
      params.push(parseInt(year as string));
    }

    if (status) {
      query += ' AND lh.status = ?';
      params.push(status as string);
    }

    query += ' ORDER BY lh.created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rows]: any = await pool.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM leave_history lh WHERE 1=1`;
    const countParams: any[] = [];

    if (userId) {
      countQuery += ' AND lh.user_id = ?';
      countParams.push(parseInt(userId as string));
    }

    if (year) {
      countQuery += ' AND YEAR(lh.start_date) = ?';
      countParams.push(parseInt(year as string));
    }

    if (status) {
      countQuery += ' AND lh.status = ?';
      countParams.push(status as string);
    }

    const [countRows]: any = await pool.execute(countQuery, countParams);

    return res.json({
      success: true,
      message: 'Leave history retrieved successfully',
      data: {
        leaveHistory: rows,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(countRows[0].total / limitNum),
          totalItems: countRows[0].total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get leave history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/leave/:id - Get specific leave request
// Note: This route must be AFTER /, /my-requests, /balance, /history
// Only match numeric IDs to avoid conflicts with named routes
router.get('/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;

    // Only process if this is a numeric ID, otherwise let Express try other routes
    if (!/^\d+$/.test(idStr)) {
      return next(); // Let Express continue to other routes
    }

    const leaveRequestId = parseInt(idStr);

    if (isNaN(leaveRequestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave request ID'
      });
    }

    const leaveRequest = await LeaveRequestModel.findById(leaveRequestId);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user can access this leave request (owner or has admin permission)
    const currentUserId = req.currentUser?.id;
    const currentUserRole = req.currentUser?.role_id;

    // Allow access if: user is the owner, or user is admin (role 1 or 2)
    const isOwner = leaveRequest.user_id === currentUserId;
    const isAdmin = currentUserRole === 1 || currentUserRole === 2;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this leave request'
      });
    }

    return res.json({
      success: true,
      message: 'Leave request retrieved successfully',
      data: { leaveRequest }
    });
  } catch (error) {
    console.error('Get leave request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/leave - Create new leave request
router.post('/', authenticateJWT, checkPermission('leave:create'), async (req: Request, res: Response) => {
  try {
    const { 
      leave_type_id, 
      start_date, 
      end_date, 
      reason, 
      attachments 
    } = req.body;

    // Validate required fields
    if (!leave_type_id || !start_date || !end_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type ID, start date, end date, and reason are required'
      });
    }

    // Validate dates
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const today = new Date();
    
    if (startDateObj < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }
    
    if (endDateObj < startDateObj) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    const userId = req.currentUser?.id;

    // Check if user has sufficient leave balance
    const leaveType = await LeaveTypeModel.findById(leave_type_id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }

    // Check leave allocation for this user
    const allocations = await LeaveAllocationModel.findByUserIdAndTypeId(userId!, leave_type_id);

    if (!allocations || allocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No leave allocation found for this user and leave type'
      });
    }

    // Use the first allocation (most recent based on ordering in the model)
    const allocation = allocations[0];

    // Get pending leave days for this leave type
    const [pendingRows]: any = await pool.execute(
      `SELECT COALESCE(SUM(days_requested), 0) as pending_days
       FROM leave_requests
       WHERE user_id = ? AND leave_type_id = ? AND status IN ('submitted', 'pending') AND id != ?`,
      [userId, leave_type_id, -1]
    );

    const pendingDays = parseFloat(pendingRows[0].pending_days);

    // Calculate remaining days for this allocation (subtract pending requests)
    const remainingDays = allocation.allocated_days - allocation.used_days + allocation.carried_over_days - pendingDays;

    // Calculate requested days
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    const requestedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both start and end date

    // Check if user has enough balance
    if (remainingDays < requestedDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Requested: ${requestedDays} days, Available: ${remainingDays} days (excluding ${pendingDays} days in pending requests)`
      });
    }

    // Create leave request
    const leaveRequest = await LeaveRequestModel.create({
      user_id: userId!,
      leave_type_id,
      start_date,
      end_date,
      days_requested: requestedDays,
      reason,
      attachments: attachments || null,
      status: 'submitted'
    });

    // Send notification to users with leave:approve permission
    try {
      const [approverRows]: any = await pool.execute(
        `SELECT DISTINCT u.id, u.full_name, u.email
         FROM users u
         INNER JOIN roles_permissions rp ON u.role_id = rp.role_id
         WHERE rp.permission = 'leave:approve' AND rp.allow_deny = 'allow' AND u.status = 'active'`
      );

      if (approverRows.length > 0) {
        const { NotificationService } = await import('../services/notification.service');
        const notificationService = new NotificationService();

        for (const approver of approverRows) {
          await notificationService.queueNotification(
            approver.id,
            'leave_request_pending',
            {
              approver_name: approver.full_name,
              staff_name: req.currentUser?.full_name || 'Employee',
              leave_type: leaveType.name,
              start_date: startDate,
              end_date: endDate,
              days: requestedDays,
              reason: reason,
              company_name: process.env.APP_NAME || 'Our Company'
            }
          );
        }
      }
    } catch (notificationError) {
      console.error('Error sending leave request notifications:', notificationError);
    }

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: { leaveRequest }
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/leave/:id - Update leave request
router.put('/:id', authenticateJWT, checkPermission('leave:update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;

    // Only process if this is a numeric ID, otherwise let Express try other routes
    if (!/^\d+$/.test(idStr)) {
      return next();
    }

    const leaveRequestId = parseInt(idStr);
    const { status, reason } = req.body;

    if (isNaN(leaveRequestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave request ID'
      });
    }

    // Get existing leave request
    const existingRequest = await LeaveRequestModel.findById(leaveRequestId);

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Only allow status updates (not date changes after submission)
    if (status && !['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Check if status is changing to approved
    const isApproving = status === 'approved' && existingRequest.status !== 'approved';

    // Check if status is changing from approved to cancelled/rejected (refund days)
    const isRefunding = existingRequest.status === 'approved' && (status === 'cancelled' || status === 'rejected');

    // Get connection for transaction
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update the leave request
      const updatedRequest = await LeaveRequestModel.update(leaveRequestId, {
        status: status as any,
        notes: reason,
        reviewed_by: status ? req.currentUser?.id : undefined,
        reviewed_at: status ? new Date() : undefined
      }, connection);

      // If approved, update the allocation's used_days (deduct days)
      if (isApproving) {
        // Find the user's allocation for this leave type
        const allocations = await LeaveAllocationModel.findByUserIdAndTypeId(
          existingRequest.user_id,
          existingRequest.leave_type_id,
          connection
        );

        // Find active allocation (cycle_end_date is in the future)
        const activeAllocation = allocations.find(
          alloc => new Date(alloc.cycle_end_date) >= new Date()
        );

        if (activeAllocation) {
          await LeaveAllocationModel.updateUsedDays(activeAllocation.id, existingRequest.days_requested, connection);
          
          // Send approval notification
          const { NotificationService } = await import('../services/notification.service');
          const notificationService = new NotificationService();
          
          await notificationService.queueNotification(
            existingRequest.user_id,
            'leave_request_approved',
            {
              staff_name: existingRequest.user_name || 'Employee',
              leave_type: existingRequest.leave_type_name || 'Leave',
              start_date: existingRequest.start_date,
              end_date: existingRequest.end_date,
              days: existingRequest.days_requested,
              approver_name: req.currentUser?.full_name || 'Approver',
              approval_date: new Date().toISOString().split('T')[0],
              request_id: existingRequest.id,
              company_name: process.env.APP_NAME || 'Our Company'
            }
          );
        } else {
          console.warn(
            `No active allocation found for user ${existingRequest.user_id}, leave type ${existingRequest.leave_type_id}. Cannot deduct days.`
          );
        }
      }

      // If refunding (approved -> cancelled/rejected), refund the days
      if (isRefunding) {
        const allocations = await LeaveAllocationModel.findByUserIdAndTypeId(
          existingRequest.user_id,
          existingRequest.leave_type_id,
          connection
        );

        const activeAllocation = allocations.find(
          alloc => new Date(alloc.cycle_end_date) >= new Date()
        );

        if (activeAllocation) {
          await LeaveAllocationModel.updateUsedDays(activeAllocation.id, -existingRequest.days_requested, connection);
          
          // Send rejection/cancellation notification
          const { NotificationService } = await import('../services/notification.service');
          const notificationService = new NotificationService();
          
          const templateName = status === 'rejected' ? 'leave_request_rejected' : 'leave_request_cancelled';
          await notificationService.queueNotification(
            existingRequest.user_id,
            templateName,
            {
              staff_name: existingRequest.user_name || 'Employee',
              leave_type: existingRequest.leave_type_name || 'Leave',
              start_date: existingRequest.start_date,
              end_date: existingRequest.end_date,
              days: existingRequest.days_requested,
              approver_name: req.currentUser?.full_name || 'Approver',
              rejection_date: new Date().toISOString().split('T')[0],
              rejection_reason: reason || 'No reason provided',
              request_id: existingRequest.id,
              company_name: process.env.APP_NAME || 'Our Company'
            }
          );
        }
      }

      await connection.commit();

      return res.json({
        success: true,
        message: 'Leave request updated successfully',
        data: { leaveRequest: updatedRequest }
      });
    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update leave request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/leave/:id - Delete/cancel leave request
router.delete('/:id', authenticateJWT, checkPermission('leave:delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;

    // Only process if this is a numeric ID, otherwise let Express try other routes
    if (!/^\d+$/.test(idStr)) {
      return next();
    }

    const leaveRequestId = parseInt(idStr);

    if (isNaN(leaveRequestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave request ID'
      });
    }

    // Check if leave request exists
    const existingRequest = await LeaveRequestModel.findById(leaveRequestId);

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Only allow cancellation if status is submitted or approved
    if (!['submitted', 'approved'].includes(existingRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel leave request that is already rejected'
      });
    }

    // Check if leave start date has already passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(existingRequest.start_date);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel leave request for dates that have already passed'
      });
    }

    // Update status to cancelled
    await LeaveRequestModel.update(leaveRequestId, { status: 'cancelled', notes: 'Cancelled by user' });

    // If the leave was approved, refund the days
    if (existingRequest.status === 'approved') {
      const allocations = await LeaveAllocationModel.findByUserIdAndTypeId(
        existingRequest.user_id,
        existingRequest.leave_type_id
      );

      const activeAllocation = allocations.find(
        alloc => new Date(alloc.cycle_end_date) >= new Date()
      );

      if (activeAllocation) {
        // Subtract the days (negative value to refund)
        await LeaveAllocationModel.updateUsedDays(activeAllocation.id, -existingRequest.days_requested);
        console.log(
          `Refunded ${existingRequest.days_requested} days for user ${existingRequest.user_id}, leave type ${existingRequest.leave_type_id} (approved leave cancelled)`
        );
      } else {
        console.warn(
          `No active allocation found for user ${existingRequest.user_id}, leave type ${existingRequest.leave_type_id}. Cannot refund days.`
        );
      }
    }

    return res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel leave request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;