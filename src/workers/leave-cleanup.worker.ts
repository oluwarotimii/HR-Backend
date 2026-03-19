/**
 * Leave Cleanup Worker
 * Automatically declines pending leave requests with dates that have passed
 * Runs daily at 2:00 AM
 */

import { pool } from '../config/database';

interface LeaveRequest {
  id: number;
  user_id: number;
  start_date: Date;
  end_date: Date;
  status: string;
}

class LeaveCleanupWorker {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;
  private static lastRunTime: Date | null = null;
  private static nextRunTime: Date | null = null;
  private static totalProcessed = 0;
  private static totalDeclined = 0;
  private static totalErrors = 0;

  /**
   * Start the leave cleanup worker
   * Runs daily at 2:00 AM
   */
  public static start(): void {
    console.log('🕐 Leave Cleanup Worker: Starting...');

    // Calculate milliseconds until next 2:00 AM
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(2, 0, 0, 0);

    if (now > nextRun) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const msUntilNextRun = nextRun.getTime() - now.getTime();
    this.nextRunTime = nextRun;

    console.log(`🕐 Leave Cleanup Worker: First run scheduled for ${nextRun.toISOString()}`);
    console.log(`🕐 Leave Cleanup Worker: Will run in ${Math.round(msUntilNextRun / 1000 / 60)} minutes`);

    // Schedule first run
    setTimeout(() => {
      this.runCleanup();

      // Then run every 24 hours
      this.intervalId = setInterval(() => {
        this.runCleanup();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntilNextRun);
  }

  /**
   * Stop the leave cleanup worker
   */
  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🕐 Leave Cleanup Worker: Stopped');
    }
  }

  /**
   * Get the last run time
   */
  public static getLastRunTime(): Date | null {
    return this.lastRunTime;
  }

  /**
   * Get the next scheduled run time
   */
  public static getNextRunTime(): Date | null {
    return this.nextRunTime;
  }

  /**
   * Get statistics
   */
  public static getStats(): {
    totalProcessed: number;
    totalDeclined: number;
    totalErrors: number;
  } {
    return {
      totalProcessed: this.totalProcessed,
      totalDeclined: this.totalDeclined,
      totalErrors: this.totalErrors
    };
  }

  /**
   * Run the cleanup process
   */
  private static async runCleanup(): Promise<void> {
    if (this.isRunning) {
      console.log('🕐 Leave Cleanup Worker: Already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    this.lastRunTime = new Date();

    try {
      console.log('🕐 Leave Cleanup Worker: Starting cleanup process...');

      // Get all pending leave requests (both 'pending' and 'submitted' statuses)
      const [pendingLeaves]: any = await pool.execute(`
        SELECT id, user_id, start_date, end_date, status
        FROM leave_requests
        WHERE status IN ('pending', 'submitted')
        ORDER BY start_date ASC
      `);

      if (pendingLeaves.length === 0) {
        console.log('🕐 Leave Cleanup Worker: No pending leave requests to process');
        this.totalProcessed = 0;
        this.totalDeclined = 0;
        this.totalErrors = 0;
        return;
      }

      console.log(`🕐 Leave Cleanup Worker: Found ${pendingLeaves.length} pending leave requests`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let declinedCount = 0;
      let errorCount = 0;

      // Process each pending leave request
      for (const leave of pendingLeaves) {
        try {
          const leaveEndDate = new Date(leave.end_date);
          leaveEndDate.setHours(0, 0, 0, 0);

          // Check if leave end date has passed
          if (leaveEndDate < today) {
            // Decline the leave request
            await pool.execute(`
              UPDATE leave_requests
              SET
                status = 'rejected',
                notes = 'Automatically declined: Leave dates have passed',
                reviewed_by = NULL,
                reviewed_at = NOW()
              WHERE id = ?
            `, [leave.id]);

            declinedCount++;
            console.log(`✓ Leave #${leave.id} declined (ended ${leave.end_date})`);

            // TODO: Send notification to employee about auto-declined leave
            // await NotificationService.sendLeaveDeclined(leave.user_id, leave.id);
          }
        } catch (error) {
          errorCount++;
          console.error(`✗ Error processing leave #${leave.id}:`, error);
        }
      }

      const duration = Date.now() - startTime;
      
      // Update totals
      this.totalProcessed = pendingLeaves.length;
      this.totalDeclined = declinedCount;
      this.totalErrors = errorCount;

      console.log(`🕐 Leave Cleanup Worker: Completed in ${duration}ms`);
      console.log(`  - Total processed: ${pendingLeaves.length}`);
      console.log(`  - Declined: ${declinedCount}`);
      console.log(`  - Errors: ${errorCount}`);

    } catch (error) {
      console.error('🕐 Leave Cleanup Worker: Error during cleanup:', error);
      this.totalErrors++;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger cleanup (for testing/admin use)
   */
  public static async triggerCleanup(): Promise<{
    success: boolean;
    message: string;
    declinedCount: number;
    errorCount: number;
  }> {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Cleanup already running',
        declinedCount: 0,
        errorCount: 0
      };
    }

    const startTime = Date.now();
    this.isRunning = true;
    this.lastRunTime = new Date();

    try {
      // Get all pending leave requests (both 'pending' and 'submitted' statuses)
      const [pendingLeaves]: any = await pool.execute(`
        SELECT id, user_id, start_date, end_date, status
        FROM leave_requests
        WHERE status IN ('pending', 'submitted')
        ORDER BY start_date ASC
      `);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let declinedCount = 0;
      let errorCount = 0;

      for (const leave of pendingLeaves) {
        try {
          const leaveEndDate = new Date(leave.end_date);
          leaveEndDate.setHours(0, 0, 0, 0);

          if (leaveEndDate < today) {
            await pool.execute(`
              UPDATE leave_requests
              SET
                status = 'rejected',
                notes = 'Automatically declined: Leave dates have passed',
                reviewed_by = NULL,
                reviewed_at = NOW()
              WHERE id = ?
            `, [leave.id]);

            declinedCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      // Update totals
      this.totalProcessed = pendingLeaves.length;
      this.totalDeclined = declinedCount;
      this.totalErrors = errorCount;

      return {
        success: true,
        message: `Processed ${pendingLeaves.length} pending requests, declined ${declinedCount}`,
        declinedCount,
        errorCount
      };

    } catch (error) {
      this.totalErrors++;
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        declinedCount: 0,
        errorCount: 1
      };
    } finally {
      this.isRunning = false;
    }
  }
}

export default LeaveCleanupWorker;
