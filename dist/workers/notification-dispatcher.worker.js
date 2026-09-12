"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatcherWorker = void 0;
const notification_service_1 = require("../services/notification.service");
class NotificationDispatcherWorker {
    static isRunning = false;
    static async processNotificationQueue() {
        if (this.isRunning) {
            console.log('Notification dispatcher is already running, skipping this cycle');
            return;
        }
        this.isRunning = true;
        console.log('Starting notification queue processing...');
        try {
            const processedCount = await notification_service_1.notificationService.processNotificationQueue(50);
            console.log(`Notification queue processing completed. Processed ${processedCount} notifications`);
        }
        catch (error) {
            console.error('Error in notification dispatcher worker:', error);
            throw error;
        }
        finally {
            this.isRunning = false;
        }
    }
    static startWorker(intervalSeconds = 300) {
        console.log(`Starting notification dispatcher worker with ${intervalSeconds}-second intervals...`);
        this.processNotificationQueue().catch(error => {
            console.error('Error running notification dispatcher on startup:', error);
        });
        setInterval(() => {
            this.processNotificationQueue().catch(error => {
                console.error('Error running notification dispatcher:', error);
            });
        }, intervalSeconds * 1000);
    }
}
exports.NotificationDispatcherWorker = NotificationDispatcherWorker;
if (require.main === module) {
    const intervalSeconds = parseInt(process.env.NOTIFICATION_DISPATCH_INTERVAL || '300');
    NotificationDispatcherWorker.startWorker(intervalSeconds);
}
//# sourceMappingURL=notification-dispatcher.worker.js.map