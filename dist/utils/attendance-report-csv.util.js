"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAttendanceReportCsv = renderAttendanceReportCsv;
function escapeCsvCell(value) {
    const str = String(value);
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}
function toCsvRow(cells) {
    return cells.map(escapeCsvCell).join(',');
}
function renderAttendanceReportCsv(data) {
    const lines = [];
    lines.push(`Attendance Report,${data.startDate} to ${data.endDate},${data.branchFilter}`);
    lines.push('');
    lines.push('SUMMARY');
    lines.push(toCsvRow(['Employee', 'Employee ID', 'Branch', 'Present', 'Late', 'Absent', 'Half Day', 'Early Departure', 'Leave', 'Total Days', 'Punctuality Score']));
    for (const group of data.summaryByBranch) {
        for (const s of group.staff) {
            lines.push(toCsvRow([
                s.full_name,
                s.employee_id ?? '',
                group.branchName,
                s.present_days,
                s.late_days,
                s.absent_days,
                s.half_day_days,
                s.early_departure_days,
                s.leave_days,
                s.total_days,
                s.points,
            ]));
        }
    }
    lines.push('');
    lines.push('LEADERBOARD');
    lines.push(toCsvRow(['Rank', 'Employee', 'Branch', 'Punctuality Score', 'Avg Arrival']));
    data.leaderboard.forEach((s, i) => {
        lines.push(toCsvRow([i + 1, s.full_name, s.branch_name ?? '', s.points, s.avg_check_in_time ?? '']));
    });
    return lines.join('\n');
}
//# sourceMappingURL=attendance-report-csv.util.js.map