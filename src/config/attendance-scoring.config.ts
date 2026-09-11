import { Attendance } from '../models/attendance.model';

export type ScorableAttendanceStatus = Attendance['status'];

/**
 * Single source of truth for the attendance leaderboard's point values.
 * Absent is the only penalty — a genuine no-show costs a point. Late is
 * neutral (0): showing up late still beats not showing up, but doesn't earn
 * the same credit as being on time. Non-working days (leave/holiday/weekend)
 * are excluded from scoring entirely rather than rewarded or punished.
 *
 * Change values here only — `buildPointsCaseSql()` generates the SQL from
 * this object, so there is never a second copy to keep in sync.
 */
export const ATTENDANCE_STATUS_POINTS: Record<ScorableAttendanceStatus, number> = {
  present: 1,
  half_day: 1,
  early_departure: 1,
  'holiday-working': 1,
  late: 0,
  absent: -1,
  leave: 0,
  holiday: 0,
  weekend: 0,
};

/**
 * Builds a `CASE a.status WHEN ... THEN ... END` SQL fragment from
 * ATTENDANCE_STATUS_POINTS, for use inside a `SUM(...)` in an aggregation
 * query. `columnRef` is the fully-qualified column (e.g. `a.status`).
 */
export function buildPointsCaseSql(columnRef: string): string {
  const whens = Object.entries(ATTENDANCE_STATUS_POINTS)
    .map(([status, points]) => `WHEN '${status}' THEN ${points}`)
    .join(' ');
  return `CASE ${columnRef} ${whens} ELSE 0 END`;
}
