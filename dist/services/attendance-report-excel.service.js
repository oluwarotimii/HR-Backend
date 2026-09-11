"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAttendanceReportExcel = renderAttendanceReportExcel;
const exceljs_1 = __importDefault(require("exceljs"));
async function renderAttendanceReportExcel(data) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Femtech HR';
    workbook.created = new Date();
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
        { header: 'Employee', key: 'full_name', width: 28 },
        { header: 'Employee ID', key: 'employee_id', width: 16 },
        { header: 'Branch', key: 'branch_name', width: 20 },
        { header: 'Present', key: 'present_days', width: 10 },
        { header: 'Late', key: 'late_days', width: 8 },
        { header: 'Absent', key: 'absent_days', width: 10 },
        { header: 'Half Day', key: 'half_day_days', width: 10 },
        { header: 'Early Departure', key: 'early_departure_days', width: 16 },
        { header: 'Leave', key: 'leave_days', width: 8 },
        { header: 'Total Days', key: 'total_days', width: 12 },
        { header: 'Points', key: 'points', width: 10 },
    ];
    summarySheet.getRow(1).font = { bold: true };
    for (const group of data.summaryByBranch) {
        for (const s of group.staff) {
            summarySheet.addRow({
                full_name: s.full_name,
                employee_id: s.employee_id ?? '',
                branch_name: group.branchName,
                present_days: s.present_days,
                late_days: s.late_days,
                absent_days: s.absent_days,
                half_day_days: s.half_day_days,
                early_departure_days: s.early_departure_days,
                leave_days: s.leave_days,
                total_days: s.total_days,
                points: s.points,
            });
        }
    }
    const leaderboardSheet = workbook.addWorksheet('Leaderboard');
    leaderboardSheet.columns = [
        { header: 'Rank', key: 'rank', width: 8 },
        { header: 'Employee', key: 'full_name', width: 28 },
        { header: 'Branch', key: 'branch_name', width: 20 },
        { header: 'Points', key: 'points', width: 10 },
    ];
    leaderboardSheet.getRow(1).font = { bold: true };
    data.leaderboard.forEach((s, i) => {
        leaderboardSheet.addRow({
            rank: i + 1,
            full_name: s.full_name,
            branch_name: s.branch_name ?? '',
            points: s.points,
        });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
//# sourceMappingURL=attendance-report-excel.service.js.map