"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeLine = sanitizeLine;
exports.writeLog = writeLog;
exports.getLogs = getLogs;
exports.clearLogs = clearLogs;
exports.createLogStream = createLogStream;
exports.patchConsole = patchConsole;
exports.unpatchConsole = unpatchConsole;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const LOG_DIR = path_1.default.join(process.cwd(), 'logs');
const LOG_FILE = path_1.default.join(LOG_DIR, 'system.log');
const SENSITIVE_PATTERNS = [
    { regex: /Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, replacement: 'Bearer ***REDACTED***' },
    { regex: /(password|passwd|pwd)[=:]\s*['"]?\S+['"]?/gi, replacement: '$1=***REDACTED***' },
    { regex: /(secret|api_key|apiKey|apikey)[=:]\s*['"]?\S+['"]?/gi, replacement: '$1=***REDACTED***' },
    { regex: /(JWT_SECRET|JWT_REFRESH_SECRET|RESEND_API_KEY|LOGS_SECRET)=[^\s&]+/g, replacement: '$1=***REDACTED***' },
    { regex: /(token|refresh_token|access_token)[=:]\s*['"]?\S+['"]?/gi, replacement: '$1=***REDACTED***' },
    { regex: /(authorization):\s*Bearer\s+\S+/gi, replacement: '$1: ***REDACTED***' },
];
function ensureLogDir() {
    if (!fs_1.default.existsSync(LOG_DIR)) {
        fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
    }
}
function getLogFilePath() {
    ensureLogDir();
    return LOG_FILE;
}
function formatLogEntry(level, args) {
    const timestamp = new Date().toISOString();
    const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    return `[${timestamp}] [${level}] ${message}\n`;
}
function sanitizeLine(line) {
    let sanitized = line;
    for (const { regex, replacement } of SENSITIVE_PATTERNS) {
        sanitized = sanitized.replace(regex, replacement);
    }
    return sanitized;
}
function writeLog(level, ...args) {
    try {
        const filePath = getLogFilePath();
        const entry = formatLogEntry(level, args);
        fs_1.default.appendFileSync(filePath, entry, 'utf-8');
    }
    catch {
    }
}
function getLogs(hours = 24, maxLines = 500, sanitize = true) {
    try {
        const filePath = getLogFilePath();
        if (!fs_1.default.existsSync(filePath))
            return '';
        const content = fs_1.default.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(Boolean);
        if (lines.length === 0)
            return '';
        const cutoff = Date.now() - hours * 60 * 60 * 1000;
        const recentLines = lines.filter(line => {
            const match = line.match(/^\[([^\]]+)\]/);
            if (!match)
                return false;
            const ts = new Date(match[1]).getTime();
            return !isNaN(ts) && ts >= cutoff;
        });
        const limited = recentLines.slice(-maxLines);
        const result = sanitize
            ? limited.map(sanitizeLine)
            : limited;
        return result.join('\n') + '\n';
    }
    catch (err) {
        return `Error reading logs: ${err}\n`;
    }
}
function clearLogs() {
    try {
        const filePath = getLogFilePath();
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, '', 'utf-8');
        }
    }
    catch {
    }
}
function createLogStream() {
    return {
        write: (text) => {
            writeLog('HTTP', text.trim());
        }
    };
}
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
function patchConsole() {
    console.log = (...args) => {
        writeLog('INFO', ...args);
        originalLog.apply(console, args);
    };
    console.error = (...args) => {
        writeLog('ERROR', ...args);
        originalError.apply(console, args);
    };
    console.warn = (...args) => {
        writeLog('WARN', ...args);
        originalWarn.apply(console, args);
    };
}
function unpatchConsole() {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
}
ensureLogDir();
//# sourceMappingURL=logger.js.map