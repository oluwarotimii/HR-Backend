import { pool } from '../config/database';
import { ShiftSchedulingService } from '../services/shift-scheduling.service';
import { notificationService } from '../services/notification.service';

const REMINDER_MINUTES_BEFORE_SHIFT = 10;

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Checks every active staff member's effective schedule for today (reusing
 * ShiftSchedulingService.getEffectiveScheduleForDate — the same resolver
 * attendance processing uses, so exceptions/leave/holidays/branch mappings
 * are all honored) and sends a one-time push reminder ~10 minutes before
 * their shift starts, unless they've already clocked in or already got a
 * reminder today.
 */
export class ClockInReminderWorker {
  private static isRunning = false;

  static async run(): Promise<void> {
    if (this.isRunning) {
      console.log('Clock-in reminder worker is already running, skipping this cycle');
      return;
    }
    this.isRunning = true;

    try {
      const now = new Date();
      const today = fmtDate(now);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const [staffRows]: any = await pool.execute(
        `SELECT s.user_id, s.branch_id, b.name AS branch_name
         FROM staff s
         LEFT JOIN branches b ON b.id = s.branch_id
         WHERE s.status = 'active'`
      );

      let sent = 0;
      for (const staff of staffRows) {
        try {
          const schedule = await ShiftSchedulingService.getEffectiveScheduleForDate(staff.user_id, now);
          if (!schedule?.start_time) continue; // non-working day, holiday, or on leave

          const [h, m] = schedule.start_time.split(':').map(Number);
          const startMinutes = h * 60 + m;
          const reminderMinutes = startMinutes - REMINDER_MINUTES_BEFORE_SHIFT;

          // Fire once the reminder window has arrived; dedup below (not this
          // window check) is what actually guarantees a single send per day.
          if (nowMinutes < reminderMinutes) continue;

          const [alreadyChecked]: any = await pool.execute(
            `SELECT id FROM attendance WHERE user_id = ? AND date = ? AND check_in_time IS NOT NULL LIMIT 1`,
            [staff.user_id, today]
          );
          if (alreadyChecked.length > 0) continue;

          const [alreadyReminded]: any = await pool.execute(
            `SELECT id FROM notification_logs
             WHERE recipient_user_id = ? AND notification_type = 'clock_in_reminder' AND DATE(created_at) = CURDATE()
             LIMIT 1`,
            [staff.user_id]
          );
          if (alreadyReminded.length > 0) continue;

          await notificationService.queueNotification(
            staff.user_id,
            'clock_in_reminder',
            {
              branch_name: staff.branch_name || 'your branch',
              start_time: schedule.start_time.substring(0, 5),
            },
            { channel: 'push' }
          );
          sent++;
        } catch (error) {
          console.error(`Error checking clock-in reminder for user ${staff.user_id}:`, error);
        }
      }

      if (sent > 0) {
        console.log(`Clock-in reminder worker queued ${sent} reminder(s); dispatching now.`);
        // Send right away rather than waiting for the next dispatcher tick —
        // a "10 minutes before" reminder delivered several minutes late
        // defeats the point.
        await notificationService.processNotificationQueue(sent);
      }
    } catch (error) {
      console.error('Error in clock-in reminder worker:', error);
    } finally {
      this.isRunning = false;
    }
  }

  static startWorker(intervalSeconds: number = 300): void {
    console.log(`Starting clock-in reminder worker with ${intervalSeconds}-second intervals...`);
    this.run().catch((error) => console.error('Error running clock-in reminder worker on startup:', error));
    setInterval(() => {
      this.run().catch((error) => console.error('Error running clock-in reminder worker:', error));
    }, intervalSeconds * 1000);
  }
}
