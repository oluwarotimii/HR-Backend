"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const attendance_model_1 = __importDefault(require("../models/attendance.model"));
const staff_model_1 = __importDefault(require("../models/staff.model"));
const date_range_util_1 = require("../utils/date-range.util");
const router = (0, express_1.Router)();
const MAX_OFFSET_BACK = {
    week: -52,
    month: -24,
    year: -10,
};
function toRanked(rows) {
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
router.get('/leaderboard', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('attendance:read'), async (req, res) => {
    try {
        const period = req.query.period || 'week';
        if (!['week', 'month', 'year'].includes(period)) {
            return res.status(400).json({ success: false, message: 'period must be one of week, month, year' });
        }
        const rawOffset = req.query.offset !== undefined ? Number(req.query.offset) : 0;
        if (!Number.isFinite(rawOffset) || !Number.isInteger(rawOffset)) {
            return res.status(400).json({ success: false, message: 'offset must be an integer' });
        }
        if (rawOffset > 0) {
            return res.status(400).json({ success: false, message: 'offset cannot be positive (no future periods)' });
        }
        const offset = Math.max(rawOffset, MAX_OFFSET_BACK[period]);
        const userId = req.currentUser?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No user information' });
        }
        const staff = await staff_model_1.default.findByUserId(userId);
        const branchId = staff?.branch_id ?? undefined;
        const range = (0, date_range_util_1.getPeriodRange)(period, offset);
        const { startDate, endDate } = range;
        const periodLabel = (0, date_range_util_1.getPeriodLabel)(period, offset, range);
        const [companyRows, branchRows] = await Promise.all([
            attendance_model_1.default.getAttendanceSummaryForAllStaff(startDate, endDate),
            branchId
                ? attendance_model_1.default.getAttendanceSummaryForAllStaff(startDate, endDate, branchId)
                : Promise.resolve([]),
        ]);
        const company = toRanked(companyRows);
        const branch = toRanked(branchRows);
        const companyEntry = company.find((r) => r.user_id === userId);
        const branchEntry = branch.find((r) => r.user_id === userId);
        return res.json({
            success: true,
            data: {
                period,
                offset,
                periodLabel,
                canGoOlder: offset > MAX_OFFSET_BACK[period],
                startDate,
                endDate,
                company,
                branch,
                currentUser: {
                    user_id: userId,
                    companyRank: companyEntry?.rank ?? null,
                    branchRank: branchEntry?.rank ?? null,
                    points: companyEntry?.points ?? 0,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching attendance leaderboard:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=attendance-leaderboard.route.js.map