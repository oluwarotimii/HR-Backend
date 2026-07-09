export declare function sanitizeLine(line: string): string;
export declare function writeLog(level: string, ...args: unknown[]): void;
export declare function getLogs(hours?: number, maxLines?: number, sanitize?: boolean): string;
export declare function clearLogs(): void;
export declare function createLogStream(): {
    write: (text: string) => void;
};
export declare function patchConsole(): void;
export declare function unpatchConsole(): void;
//# sourceMappingURL=logger.d.ts.map