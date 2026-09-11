import AttendanceModel, { StaffAttendanceSummaryRow } from '../models/attendance.model';
import BranchModel from '../models/branch.model';

export interface AttendanceReportData {
  startDate: string;
  endDate: string;
  branchFilter: string;
  summaryByBranch: { branchName: string; staff: StaffAttendanceSummaryRow[] }[];
  leaderboard: StaffAttendanceSummaryRow[];
}

/**
 * Single shared data-assembly function feeding both the HR export (CSV/PDF/
 * Excel) and the Admin on-screen leaderboard preview — one query, grouped
 * two different ways, so the summary and leaderboard sections of an export
 * always agree with each other for the same date range.
 *
 * Unlike the staff-facing leaderboard endpoint (which excludes inactive
 * staff), this does not filter by staff status — HR may need a departed
 * employee's attendance history for a period predating their exit.
 */
export async function buildAttendanceReportData(
  startDate: string,
  endDate: string,
  branchId?: number
): Promise<AttendanceReportData> {
  const rows = await AttendanceModel.getAttendanceSummaryForAllStaff(startDate, endDate, branchId, false);

  const byBranch = new Map<string, StaffAttendanceSummaryRow[]>();
  for (const row of rows) {
    const name = row.branch_name || 'Unassigned';
    if (!byBranch.has(name)) byBranch.set(name, []);
    byBranch.get(name)!.push(row);
  }
  const summaryByBranch = Array.from(byBranch.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([branchName, staff]) => ({ branchName, staff }));

  const leaderboard = [...rows].sort(
    (a, b) => b.points - a.points || b.present_days - a.present_days
  );

  let branchFilter = 'All Branches';
  if (branchId) {
    const branch = await BranchModel.findById(branchId);
    branchFilter = branch?.name || `Branch #${branchId}`;
  }

  return { startDate, endDate, branchFilter, summaryByBranch, leaderboard };
}
