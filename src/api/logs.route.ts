import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import { getLogs, clearLogs, writeLog } from '../utils/logger';

const router = Router();

const logsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many log requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function auditLog(req: Request, action: string) {
  const user = req.currentUser;
  writeLog('AUDIT', `User #${user?.id} (${user?.email}) ${action} from ${req.ip}`);
}

router.get(
  '/',
  authenticateJWT,
  checkPermission('logs:read'),
  logsRateLimiter,
  (req: Request, res: Response) => {
    const hours = Math.min(Math.max(parseInt(req.query.hours as string) || 24, 1), 168);
    const lines = Math.min(Math.max(parseInt(req.query.lines as string) || 500, 10), 5000);
    const format = req.query.format as string;
    const noSanitize = req.query.nosanitize === '1';

    auditLog(req, `viewed logs (hours=${hours}, lines=${lines}, format=${format || 'text'})`);

    const logs = getLogs(hours, lines, !noSanitize);

    if (format === 'json') {
      const logLines = logs.split('\n').filter(Boolean).map(line => {
        const match = line.match(/^\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.*)/);
        return match
          ? { timestamp: match[1], level: match[2], message: match[3] }
          : { timestamp: null, level: null, message: line };
      });
      return res.json({ success: true, count: logLines.length, data: logLines });
    }

    res.type('text/plain').send(logs || 'No logs available yet.\n');
  }
);

router.delete(
  '/',
  authenticateJWT,
  checkPermission('logs:read'),
  logsRateLimiter,
  (req: Request, res: Response) => {
    auditLog(req, 'cleared logs');
    clearLogs();
    res.json({ success: true, message: 'Logs cleared' });
  }
);

export default router;
