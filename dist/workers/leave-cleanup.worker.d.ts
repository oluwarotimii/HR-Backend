declare class LeaveCleanupWorker {
    private static isRunning;
    private static intervalId;
    private static lastRunTime;
    private static nextRunTime;
    private static totalProcessed;
    private static totalDeclined;
    private static totalErrors;
    static start(): void;
    static stop(): void;
    static getLastRunTime(): Date | null;
    static getNextRunTime(): Date | null;
    static getStats(): {
        totalProcessed: number;
        totalDeclined: number;
        totalErrors: number;
    };
    private static runCleanup;
    static triggerCleanup(): Promise<{
        success: boolean;
        message: string;
        declinedCount: number;
        errorCount: number;
    }>;
}
export default LeaveCleanupWorker;
//# sourceMappingURL=leave-cleanup.worker.d.ts.map