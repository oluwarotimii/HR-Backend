declare class AutoCheckoutWorker {
    private static isRunning;
    private static processedRecords;
    static processAutoCheckouts(): Promise<void>;
    static processStaleRecords(): Promise<void>;
    static logAutoCheckout(userId: number, date: string, reason: string): Promise<void>;
    static cleanupProcessedRecords(): void;
    static start(): Promise<void>;
    static getStatus(): {
        isRunning: boolean;
        processedRecordsCount: number;
        lastCleanup: string;
    };
}
export default AutoCheckoutWorker;
//# sourceMappingURL=auto-checkout.worker.d.ts.map