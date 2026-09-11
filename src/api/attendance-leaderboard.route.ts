import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import AttendanceModel, { StaffAttendanceSummaryRow } from '../models/attendance.model';
import StaffModel from '../models/staff.model';
import { getPeriodRange, getPeriodLabel, LeaderboardPeriod } from '../utils/date-range.util';

const router = Router();

// How far back `offset` may go, per period — generous enough to cover "the
// data we have before" without letting a request page back arbitrarily far.
const MAX_OFFSET_BACK: Record<LeaderboardPeriod, number> = {
  week: -52, // ~1 year
  month: -24, // 2 years
  year: -10,
};

function toRanked(rows: StaffAttendanceSummaryRow[]) {
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

// GET /api/attendance/leaderboard?period=week|month|year&offset=0
// Any authenticated staff member can view this — no permission gate,
// since it's a company-wide gamification feature everyone is meant to see.
// Returns both the company-wide and the caller's own branch ranking in one
// call, plus the caller's own rank in each, so the client can render
// "Company" / "Branch" tabs from a single request instead of a loading
// waterfall per toggle.
//
// `offset` (0 = current period, -1 = previous, etc.) lets clients page back
// through past weeks/months/years using data already recorded — e.g. "last
// month's leaderboard" is `period=month&offset=-1`. Positive offsets
// (future periods) are rejected; there's nothing to rank yet.
router.get('/leaderboard', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as LeaderboardPeriod) || 'week';
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

    const staff = await StaffModel.findByUserId(userId);
    const branchId = staff?.branch_id ?? undefined;

    const range = getPeriodRange(period, offset);
    const { startDate, endDate } = range;
    const periodLabel = getPeriodLabel(period, offset, range);

    const [companyRows, branchRows] = await Promise.all([
      AttendanceModel.getAttendanceSummaryForAllStaff(startDate, endDate),
      branchId
        ? AttendanceModel.getAttendanceSummaryForAllStaff(startDate, endDate, branchId)
        : Promise.resolve([] as StaffAttendanceSummaryRow[]),
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
  } catch (error) {
    console.error('Error fetching attendance leaderboard:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
