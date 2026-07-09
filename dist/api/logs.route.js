"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const logsRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many log requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
function auditLog(req, action) {
    const user = req.currentUser;
    (0, logger_1.writeLog)('AUDIT', `User #${user?.id} (${user?.email}) ${action} from ${req.ip}`);
}
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('logs:read'), logsRateLimiter, (req, res) => {
    const hours = Math.min(Math.max(parseInt(req.query.hours) || 24, 1), 168);
    const lines = Math.min(Math.max(parseInt(req.query.lines) || 500, 10), 5000);
    const format = req.query.format;
    const noSanitize = req.query.nosanitize === '1';
    auditLog(req, `viewed logs (hours=${hours}, lines=${lines}, format=${format || 'text'})`);
    const logs = (0, logger_1.getLogs)(hours, lines, !noSanitize);
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
});
router.delete('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('logs:read'), logsRateLimiter, (req, res) => {
    auditLog(req, 'cleared logs');
    (0, logger_1.clearLogs)();
    res.json({ success: true, message: 'Logs cleared' });
});
exports.default = router;
//# sourceMappingURL=logs.route.js.map