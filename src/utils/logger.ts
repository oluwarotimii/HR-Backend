import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'system.log');

const SENSITIVE_PATTERNS = [
  { regex: /Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, replacement: 'Bearer ***REDACTED***' },
  { regex: /(password|passwd|pwd)[=:]\s*['"]?\S+['"]?/gi, replacement: '$1=***REDACTED***' },
  { regex: /(secret|api_key|apiKey|apikey)[=:]\s*['"]?\S+['"]?/gi, replacement: '$1=***REDACTED***' },
  { regex: /(JWT_SECRET|JWT_REFRESH_SECRET|RESEND_API_KEY|LOGS_SECRET)=[^\s&]+/g, replacement: '$1=***REDACTED***' },
  { regex: /(token|refresh_token|access_token)[=:]\s*['"]?\S+['"]?/gi, replacement: '$1=***REDACTED***' },
  { regex: /(authorization):\s*Bearer\s+\S+/gi, replacement: '$1: ***REDACTED***' },
];

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getLogFilePath(): string {
  ensureLogDir();
  return LOG_FILE;
}

function formatLogEntry(level: string, args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  return `[${timestamp}] [${level}] ${message}\n`;
}

export function sanitizeLine(line: string): string {
  let sanitized = line;
  for (const { regex, replacement } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(regex, replacement);
  }
  return sanitized;
}

export function writeLog(level: string, ...args: unknown[]) {
  try {
    const filePath = getLogFilePath();
    const entry = formatLogEntry(level, args);
    fs.appendFileSync(filePath, entry, 'utf-8');
  } catch {
    // silently fail – don't crash the app over logging
  }
}

export function getLogs(hours: number = 24, maxLines: number = 500, sanitize: boolean = true): string {
  try {
    const filePath = getLogFilePath();
    if (!fs.existsSync(filePath)) return '';

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    if (lines.length === 0) return '';

    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recentLines = lines.filter(line => {
      const match = line.match(/^\[([^\]]+)\]/);
      if (!match) return false;
      const ts = new Date(match[1]).getTime();
      return !isNaN(ts) && ts >= cutoff;
    });

    const limited = recentLines.slice(-maxLines);
    const result = sanitize
      ? limited.map(sanitizeLine)
      : limited;
    return result.join('\n') + '\n';
  } catch (err) {
    return `Error reading logs: ${err}\n`;
  }
}

export function clearLogs() {
  try {
    const filePath = getLogFilePath();
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '', 'utf-8');
    }
  } catch {
    // silently fail
  }
}

export function createLogStream() {
  return {
    write: (text: string) => {
      writeLog('HTTP', text.trim());
    }
  };
}

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

export function patchConsole() {
  console.log = (...args: unknown[]) => {
    writeLog('INFO', ...args);
    originalLog.apply(console, args);
  };
  console.error = (...args: unknown[]) => {
    writeLog('ERROR', ...args);
    originalError.apply(console, args);
  };
  console.warn = (...args: unknown[]) => {
    writeLog('WARN', ...args);
    originalWarn.apply(console, args);
  };
}

export function unpatchConsole() {
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
}

ensureLogDir();
