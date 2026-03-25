export declare class SchedulerService {
    private static workers;
    private static initialized;
    static initializeWorkers(): void;
    static startAllWorkers(): void;
    static isInitialized(): boolean;
    static getWorkerStatus(): Array<{
        name: string;
        status: string;
    }>;
}
//# sourceMappingURL=scheduler.service.d.ts.map