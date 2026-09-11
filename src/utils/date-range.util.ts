export type LeaderboardPeriod = 'week' | 'month' | 'year';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Local-date formatting (not toISOString(), which is UTC and can roll the
// date backward/forward depending on server timezone and time of day) —
// matches the convention already used by AttendanceModel.fmtDate.
function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Returns the start/end dates (inclusive, 'yyyy-MM-dd') of the week/month/
 * year containing `now`, offset by `offset` whole periods — 0 = current
 * (the original behavior), -1 = the previous period, -2 = two back, etc.
 * Positive offsets (future periods) are not meaningful here and are the
 * caller's responsibility to reject.
 *
 * Week is ISO (Monday–Sunday), not US-style Sunday-start — an unambiguous
 * international standard that pairs naturally with a Mon–Sat business week.
 */
export function getPeriodRange(period: LeaderboardPeriod, offset: number = 0, now: Date = new Date()): DateRange {
  if (period === 'week') {
    const day = now.getDay(); // 0 = Sunday .. 6 = Saturday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + offset * 7);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { startDate: fmt(monday), endDate: fmt(sunday) };
  }

  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    return { startDate: fmt(start), endDate: fmt(end) };
  }

  // year
  const start = new Date(now.getFullYear() + offset, 0, 1);
  const end = new Date(now.getFullYear() + offset, 11, 31);
  return { startDate: fmt(start), endDate: fmt(end) };
}

/** Backward-compatible alias for offset 0 (current period). */
export function getCurrentPeriodRange(period: LeaderboardPeriod, now: Date = new Date()): DateRange {
  return getPeriodRange(period, 0, now);
}

/** Human-readable label for a period+offset, for display in the UI. */
export function getPeriodLabel(period: LeaderboardPeriod, offset: number, range: DateRange): string {
  if (period === 'week') {
    if (offset === 0) return 'This Week';
    if (offset === -1) return 'Last Week';
    return `${Math.abs(offset)} Weeks Ago`;
  }

  if (period === 'month') {
    const d = new Date(`${range.startDate}T00:00:00`);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // year
  const d = new Date(`${range.startDate}T00:00:00`);
  return String(d.getFullYear());
}
