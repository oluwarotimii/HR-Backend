import { StaffAttendanceSummaryRow } from '../models/attendance.model';
export interface AttendanceReportData {
    startDate: string;
    endDate: string;
    branchFilter: string;
    summaryByBranch: {
        branchName: string;
        staff: StaffAttendanceSummaryRow[];
    }[];
    leaderboard: StaffAttendanceSummaryRow[];
}
export declare function buildAttendanceReportData(startDate: string, endDate: string, branchId?: number): Promise<AttendanceReportData>;
//# sourceMappingURL=attendance-report.service.d.ts.map