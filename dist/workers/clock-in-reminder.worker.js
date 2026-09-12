"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClockInReminderWorker = void 0;
const database_1 = require("../config/database");
const shift_scheduling_service_1 = require("../services/shift-scheduling.service");
const notification_service_1 = require("../services/notification.service");
const REMINDER_MINUTES_BEFORE_SHIFT = 10;
function fmtDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
class ClockInReminderWorker {
    static isRunning = false;
    static async run() {
        if (this.isRunning) {
            console.log('Clock-in reminder worker is already running, skipping this cycle');
            return;
        }
        this.isRunning = true;
        try {
            const now = new Date();
            const today = fmtDate(now);
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const [staffRows] = await database_1.pool.execute(`SELECT s.user_id, s.branch_id, b.name AS branch_name
         FROM staff s
         LEFT JOIN branches b ON b.id = s.branch_id
         WHERE s.status = 'active'`);
            let sent = 0;
            for (const staff of staffRows) {
                try {
                    const schedule = await shift_scheduling_service_1.ShiftSchedulingService.getEffectiveScheduleForDate(staff.user_id, now);
                    if (!schedule?.start_time)
                        continue;
                    const [h, m] = schedule.start_time.split(':').map(Number);
                    const startMinutes = h * 60 + m;
                    const reminderMinutes = startMinutes - REMINDER_MINUTES_BEFORE_SHIFT;
                    if (nowMinutes < reminderMinutes)
                        continue;
                    const [alreadyChecked] = await database_1.pool.execute(`SELECT id FROM attendance WHERE user_id = ? AND date = ? AND check_in_time IS NOT NULL LIMIT 1`, [staff.user_id, today]);
                    if (alreadyChecked.length > 0)
                        continue;
                    const [alreadyReminded] = await database_1.pool.execute(`SELECT id FROM notification_logs
             WHERE recipient_user_id = ? AND notification_type = 'clock_in_reminder' AND DATE(created_at) = CURDATE()
             LIMIT 1`, [staff.user_id]);
                    if (alreadyReminded.length > 0)
                        continue;
                    await notification_service_1.notificationService.queueNotification(staff.user_id, 'clock_in_reminder', {
                        branch_name: staff.branch_name || 'your branch',
                        start_time: schedule.start_time.substring(0, 5),
                    }, { channel: 'push' });
                    sent++;
                }
                catch (error) {
                    console.error(`Error checking clock-in reminder for user ${staff.user_id}:`, error);
                }
            }
            if (sent > 0) {
                console.log(`Clock-in reminder worker queued ${sent} reminder(s); dispatching now.`);
                await notification_service_1.notificationService.processNotificationQueue(sent);
            }
        }
        catch (error) {
            console.error('Error in clock-in reminder worker:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    static startWorker(intervalSeconds = 300) {
        console.log(`Starting clock-in reminder worker with ${intervalSeconds}-second intervals...`);
        this.run().catch((error) => console.error('Error running clock-in reminder worker on startup:', error));
        setInterval(() => {
            this.run().catch((error) => console.error('Error running clock-in reminder worker:', error));
        }, intervalSeconds * 1000);
    }
}
exports.ClockInReminderWorker = ClockInReminderWorker;
//# sourceMappingURL=clock-in-reminder.worker.js.map