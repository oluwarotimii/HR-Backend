import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import { buildAttendanceReportData } from '../services/attendance-report.service';
import { renderAttendanceReportCsv } from '../utils/attendance-report-csv.util';
import { renderAttendanceReportExcel } from '../services/attendance-report-excel.service';
import { renderAttendanceReportPdf } from '../services/attendance-report-pdf.service';

const router = Router();

function parseQuery(req: Request): { startDate?: string; endDate?: string; branchId?: number } {
  const { startDate, endDate, branchId } = req.query as Record<string, string | undefined>;
  return {
    startDate,
    endDate,
    branchId: branchId ? Number(branchId) : undefined,
  };
}

// GET /api/reports/attendance/export?startDate=&endDate=&branchId=&format=csv|pdf|excel
// A pure download with no side effects — GET lets the browser/axios trigger
// a native file download directly. Gated by attendance:export (a distinct,
// more sensitive capability than attendance:read — one download surfaces
// every staff member's data at once, not just what the requester browses).
router.get('/export', authenticateJWT, checkPermission('attendance:export'), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, branchId } = parseQuery(req);
    const format = String(req.query.format || 'csv').toLowerCase();

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }
    if (!['csv', 'pdf', 'excel'].includes(format)) {
      return res.status(400).json({ success: false, message: 'format must be one of csv, pdf, excel' });
    }

    const data = await buildAttendanceReportData(startDate, endDate, branchId);
    const filenameBase = `attendance-report-${startDate}-to-${endDate}`;

    if (format === 'csv') {
      const csv = renderAttendanceReportCsv(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const buffer = await renderAttendanceReportExcel(data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
      return res.send(buffer);
    }

    const buffer = await renderAttendanceReportPdf(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
    return res.send(buffer);
  } catch (error) {
    console.error('Error exporting attendance report:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/reports/attendance/leaderboard?startDate=&endDate=&branchId=
// JSON-only preview (no file generation) so the Admin UI can render a
// live-updating leaderboard as HR adjusts filters, before committing to a
// download. Same permission tier as export, not the staff-facing
// attendance:read endpoint — this supports an arbitrary custom date range,
// not just the current week/month/year.
router.get('/leaderboard', authenticateJWT, checkPermission('attendance:export'), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, branchId } = parseQuery(req);
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const data = await buildAttendanceReportData(startDate, endDate, branchId);
    return res.json({
      success: true,
      data: {
        startDate,
        endDate,
        branchFilter: data.branchFilter,
        leaderboard: data.leaderboard,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance leaderboard preview:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
