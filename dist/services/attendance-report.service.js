"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAttendanceReportData = buildAttendanceReportData;
const attendance_model_1 = __importDefault(require("../models/attendance.model"));
const branch_model_1 = __importDefault(require("../models/branch.model"));
async function buildAttendanceReportData(startDate, endDate, branchId) {
    const rows = await attendance_model_1.default.getAttendanceSummaryForAllStaff(startDate, endDate, branchId, false);
    const byBranch = new Map();
    for (const row of rows) {
        const name = row.branch_name || 'Unassigned';
        if (!byBranch.has(name))
            byBranch.set(name, []);
        byBranch.get(name).push(row);
    }
    const summaryByBranch = Array.from(byBranch.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([branchName, staff]) => ({ branchName, staff }));
    const leaderboard = [...rows].sort((a, b) => b.points - a.points || b.present_days - a.present_days);
    let branchFilter = 'All Branches';
    if (branchId) {
        const branch = await branch_model_1.default.findById(branchId);
        branchFilter = branch?.name || `Branch #${branchId}`;
    }
    return { startDate, endDate, branchFilter, summaryByBranch, leaderboard };
}
//# sourceMappingURL=attendance-report.service.js.map