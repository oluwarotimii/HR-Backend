import { BirthdayNotificationWorker } from '../workers/birthday-notification.worker';
export class SchedulerService {
    static workers = [];
    static initialized = false;
    static initializeWorkers() {
        console.log('Initializing scheduled workers...');
        this.workers.push({
            name: 'Birthday Notification Worker',
            start: () => BirthdayNotificationWorker.startWorker()
        });
        this.startAllWorkers();
        this.initialized = true;
    }
    static startAllWorkers() {
        console.log(`Starting ${this.workers.length} scheduled workers...`);
        for (const worker of this.workers) {
            try {
                console.log(`Starting worker: ${worker.name}`);
                worker.start();
                console.log(`✓ Worker started successfully: ${worker.name}`);
            }
            catch (error) {
                console.error(`✗ Error starting worker ${worker.name}:`, error);
            }
        }
        console.log('All scheduled workers initialized');
    }
    static isInitialized() {
        return this.initialized;
    }
    static getWorkerStatus() {
        return this.workers.map(worker => ({
            name: worker.name,
            status: 'running'
        }));
    }
}
//# sourceMappingURL=scheduler.service.js.map