import { pool } from '../config/database';
import AttendanceModel from '../models/attendance.model';
import StaffModel from '../models/staff.model';

/**
 * Auto-Checkout Worker
 * Automatically checks out staff who forgot to check out
 * Runs every minute to check for staff who should be checked out
 */

class AutoCheckoutWorker {
  private static isRunning = false;
  private static processedRecords = new Set<string>();

  /**
   * Process auto-checkouts for all branches
   * Called every minute
   */
  static async processAutoCheckouts() {
    if (this.isRunning) {
      console.log('[Auto-Checkout] Already running, skipping');
      return;
    }

    try {
      this.isRunning = true;
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const todayStr = now.toISOString().split('T')[0];

      console.log(`[Auto-Checkout] Checking for auto-checkouts at ${currentTime}`);

      // Get all branches with auto-checkout enabled
      // Note: Wrap in try-catch to handle missing column gracefully
      let branches: any[] = [];
      try {
        const [result]: any = await pool.execute(`
          SELECT
            id,
            name,
            code,
            auto_checkout_enabled,
            auto_checkout_minutes_after_close,
            closing_time
          FROM branches
          WHERE auto_checkout_enabled = TRUE
        `);
        branches = result;
      } catch (error: any) {
        if (error.errno === 1054 || error.code === 'ER_BAD_FIELD_ERROR') {
          console.log('[Auto-Checkout] Column auto_checkout_enabled not found, skipping auto-checkout');
          this.isRunning = false;
          return;
        }
        throw error;
      }

      if (branches.length === 0) {
        console.log('[Auto-Checkout] No branches with auto-checkout enabled');
        this.isRunning = false;
        return;
      }

      console.log(`[Auto-Checkout] Found ${branches.length} branch(es) with auto-checkout enabled`);

      let totalProcessed = 0;
      let totalCheckedOut = 0;

      for (const branch of branches) {
        try {
          // Calculate checkout time for this branch
          // Default: 30 minutes after closing time
          const closingTime = branch.closing_time || '17:00';
          const minutesAfterClose = branch.auto_checkout_minutes_after_close || 30;
          
          const [closingHours, closingMinutes] = closingTime.split(':').map(Number);
          const checkoutDateTime = new Date(now);
          checkoutDateTime.setHours(closingHours, closingMinutes + minutesAfterClose, 0, 0);
          
          const checkoutTimeStr = checkoutDateTime.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          console.log(`[Auto-Checkout] Branch ${branch.name}: Close=${closingTime}, Checkout=${checkoutTimeStr}`);

          // Check if it's past checkout time for this branch
          if (now < checkoutDateTime) {
            console.log(`[Auto-Checkout] Branch ${branch.name}: Not yet checkout time (${checkoutTimeStr})`);
            continue;
          }

          // Find all staff in this branch who checked in but haven't checked out today
          const [staffResults]: any = await pool.execute(`
            SELECT s.user_id, s.branch_id, u.full_name, u.email
            FROM staff s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN attendance a ON s.user_id = a.user_id AND a.date = ?
            WHERE s.branch_id = ?
              AND s.status = 'active'
              AND u.status = 'active'
              AND a.id IS NOT NULL
              AND a.check_in_time IS NOT NULL
              AND (a.check_out_time IS NULL OR a.check_out_time = '')
          `, [todayStr, branch.id]);

          if (staffResults.length === 0) {
            console.log(`[Auto-Checkout] Branch ${branch.name}: No staff need checkout`);
            continue;
          }

          console.log(`[Auto-Checkout] Branch ${branch.name}: Found ${staffResults.length} staff needing checkout`);
          totalProcessed += staffResults.length;

          // Auto-checkout each staff member
          for (const staff of staffResults) {
            try {
              const recordKey = `${staff.user_id}-${todayStr}`;
              
              // Skip if already processed today
              if (this.processedRecords.has(recordKey)) {
                console.log(`[Auto-Checkout] Already processed ${staff.full_name} today`);
                continue;
              }

              // Check if attendance is locked
              const [attendanceRecord]: any = await pool.execute(`
                SELECT id, is_locked FROM attendance
                WHERE user_id = ? AND date = ?
              `, [staff.user_id, todayStr]);

              if (attendanceRecord.length > 0 && attendanceRecord[0].is_locked) {
                console.log(`[Auto-Checkout] Attendance locked for ${staff.full_name}, skipping`);
                continue;
              }

              // Perform auto-checkout
              const checkoutTime = now.toTimeString().substring(0, 8);
              
              await pool.execute(`
                UPDATE attendance
                SET 
                  check_out_time = ?,
                  updated_at = NOW(),
                  notes = CONCAT(IFNULL(notes, ''), ' | Auto-checked out by system')
                WHERE user_id = ? AND date = ?
              `, [checkoutTime, staff.user_id, todayStr]);

              // Log the auto-checkout
              await this.logAutoCheckout(staff.user_id, todayStr, `Auto-checkout at ${checkoutTimeStr} for branch ${branch.name}`);

              // Mark as processed
              this.processedRecords.add(recordKey);
              totalCheckedOut++;

              console.log(`[Auto-Checkout] ✓ Auto-checked out ${staff.full_name} (${staff.email}) at ${checkoutTime}`);

            } catch (error) {
              console.error(`[Auto-Checkout] Error checking out ${staff.user_id}:`, error);
            }
          }

        } catch (error) {
          console.error(`[Auto-Checkout] Error processing branch ${branch.name}:`, error);
        }
      }

      console.log(`[Auto-Checkout] Completed: Processed ${totalProcessed}, Checked out ${totalCheckedOut}`);

      // Clean up processed records from previous days
      this.cleanupProcessedRecords();

    } catch (error) {
      console.error('[Auto-Checkout] Error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process stale records from previous days
   * Auto-checkout staff who forgot to checkout on previous days
   */
  static async processStaleRecords() {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Check for records from yesterday and earlier (up to 7 days back)
      const staleDate = new Date(today);
      staleDate.setDate(staleDate.getDate() - 1);
      staleDate.setHours(18, 30, 0, 0); // Default checkout time: 6:30 PM

      const staleDateStr = staleDate.toISOString().split('T')[0];

      console.log(`[Auto-Checkout] Checking for stale records from ${staleDateStr}`);

      // Find all stale records (checked in but not checked out)
      const [staleRecords]: any = await pool.execute(`
        SELECT a.id, a.user_id, a.date, a.check_in_time, u.full_name, u.email, s.branch_id
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        JOIN staff s ON a.user_id = s.user_id
        WHERE a.date < ?
          AND a.check_in_time IS NOT NULL
          AND (a.check_out_time IS NULL OR a.check_out_time = '')
          AND a.is_locked = FALSE
          AND s.status = 'active'
          AND u.status = 'active'
        ORDER BY a.date DESC
        LIMIT 100
      `, [todayStr]);

      if (staleRecords.length === 0) {
        console.log('[Auto-Checkout] No stale records found');
        return;
      }

      console.log(`[Auto-Checkout] Found ${staleRecords.length} stale records`);

      let staleCheckedOut = 0;

      for (const record of staleRecords) {
        try {
          const recordKey = `${record.user_id}-${record.date}`;
          
          // Skip if already processed
          if (this.processedRecords.has(recordKey)) {
            continue;
          }

          // Auto-checkout at 6:30 PM for the record date
          const staleCheckoutTime = '18:30:00';
          
          await pool.execute(`
            UPDATE attendance
            SET 
              check_out_time = ?,
              updated_at = NOW(),
              notes = CONCAT(IFNULL(notes, ''), ' | Auto-checked out (stale record)')
            WHERE id = ?
          `, [staleCheckoutTime, record.id]);

          // Log the auto-checkout
          await this.logAutoCheckout(record.user_id, record.date, `Auto-checkout stale record at ${staleCheckoutTime}`);

          // Mark as processed
          this.processedRecords.add(recordKey);
          staleCheckedOut++;

          console.log(`[Auto-Checkout] ✓ Auto-checked out stale record for ${record.full_name} on ${record.date}`);

        } catch (error) {
          console.error(`[Auto-Checkout] Error processing stale record ${record.id}:`, error);
        }
      }

      console.log(`[Auto-Checkout] Stale records processed: ${staleCheckedOut}`);

    } catch (error) {
      console.error('[Auto-Checkout] Error processing stale records:', error);
    }
  }

  /**
   * Log auto-checkout to database
   */
  static async logAutoCheckout(userId: number, date: string, reason: string) {
    try {
      await pool.execute(`
        INSERT INTO attendance_auto_checkout_log
        (user_id, checkout_date, checkout_time, reason, created_at)
        VALUES (?, ?, NOW(), ?, NOW())
      `, [userId, date, reason]);
    } catch (error) {
      // Table might not exist yet, log to console
      console.log(`[Auto-Checkout Log] User ${userId}, Date ${date}, Reason: ${reason}`);
    }
  }

  /**
   * Clean up processed records older than 7 days
   */
  static cleanupProcessedRecords() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    // Remove old entries from the set
    const keysToDelete: string[] = [];
    this.processedRecords.forEach(key => {
      const datePart = key.split('-')[1];
      if (datePart < dateStr) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.processedRecords.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`[Auto-Checkout] Cleaned up ${keysToDelete.length} old processed records`);
    }
  }

  /**
   * Start the auto-checkout worker
   * Runs every minute
   */
  static async start() {
    console.log('Starting Auto-Checkout Worker...');

    // Process immediately on startup
    try {
      await this.processAutoCheckouts();
      await this.processStaleRecords();
      console.log('Initial auto-checkout processing completed');
    } catch (error) {
      console.error('Error in initial auto-checkout processing:', error);
    }

    // Start the minute-by-minute check
    console.log('[Auto-Checkout] Starting minute-by-minute check...');
    setInterval(async () => {
      try {
        await this.processAutoCheckouts();
      } catch (error) {
        console.error('[Auto-Checkout] Error in check:', error);
      }
    }, 60 * 1000); // Every minute

    // Check for stale records every 5 minutes
    setInterval(async () => {
      try {
        await this.processStaleRecords();
      } catch (error) {
        console.error('[Auto-Checkout] Error in stale check:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    console.log('[Auto-Checkout] Worker is now running');
    console.log('[Auto-Checkout] Will auto-checkout staff based on branch closing times');
  }

  /**
   * Get worker status
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      processedRecordsCount: this.processedRecords.size,
      lastCleanup: new Date().toISOString()
    };
  }
}

export default AutoCheckoutWorker;
