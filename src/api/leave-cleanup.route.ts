import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import LeaveCleanupWorker from '../workers/leave-cleanup.worker';
import { pool } from '../config/database';

const router = Router();

// POST /api/leave-cleanup/trigger - Manually trigger leave cleanup (admin only)
router.post('/trigger', authenticateJWT, checkPermission('leave:manage'), async (req: Request, res: Response) => {
  try {
    console.log('🧹 Leave Cleanup: Manual trigger requested by user', req.currentUser?.email);
    const result = await LeaveCleanupWorker.triggerCleanup();

    console.log('🧹 Leave Cleanup: Result:', result);

    return res.json({
      success: result.success,
      message: result.message,
      data: {
        declinedCount: result.declinedCount,
        errorCount: result.errorCount
      }
    });
  } catch (error) {
    console.error('Trigger leave cleanup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/leave-cleanup/status - Get cleanup status
router.get('/status', authenticateJWT, async (req: Request, res: Response) => {
  try {
    // Get count of pending leaves that have expired
    const [expiredLeaves]: any = await pool.execute(`
      SELECT COUNT(*) as count
      FROM leave_requests
      WHERE status IN ('pending', 'submitted')
      AND end_date < CURDATE()
    `);

    // Get count of all pending leaves
    const [pendingLeaves]: any = await pool.execute(`
      SELECT COUNT(*) as count
      FROM leave_requests
      WHERE status IN ('pending', 'submitted')
    `);

    // Get last run time from worker (we'll add this method)
    const lastRunTime = LeaveCleanupWorker.getLastRunTime();

    console.log('🧹 Leave Cleanup Status:', {
      expiredPendingLeaves: expiredLeaves[0]?.count || 0,
      totalPendingLeaves: pendingLeaves[0]?.count || 0,
      workerRunning: true
    });

    return res.json({
      success: true,
      data: {
        expiredPendingLeaves: expiredLeaves[0]?.count || 0,
        totalPendingLeaves: pendingLeaves[0]?.count || 0,
        workerRunning: true, // Worker is active
        lastRunTime: lastRunTime,
        nextRunTime: LeaveCleanupWorker.getNextRunTime()
      }
    });
  } catch (error) {
    console.error('Get cleanup status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
