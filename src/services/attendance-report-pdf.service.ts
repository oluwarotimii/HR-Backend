import PDFDocument from 'pdfkit';
import { AttendanceReportData } from './attendance-report.service';

interface Column {
  key: string;
  label: string;
  width: number;
}

const ROW_HEIGHT = 20;
const PAGE_BOTTOM_MARGIN = 60;

function drawTableHeader(doc: PDFKit.PDFDocument, columns: Column[], startX: number) {
  let x = startX;
  doc.font('Helvetica-Bold').fontSize(10);
  for (const col of columns) {
    doc.text(col.label, x, doc.y, { width: col.width, continued: false });
    x += col.width;
  }
  doc.moveDown(0.3);
  doc.moveTo(startX, doc.y).lineTo(startX + columns.reduce((s, c) => s + c.width, 0), doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10);
}

function ensureSpace(doc: PDFKit.PDFDocument, columns: Column[], startX: number) {
  if (doc.y + ROW_HEIGHT > doc.page.height - PAGE_BOTTOM_MARGIN) {
    doc.addPage();
    drawTableHeader(doc, columns, startX);
  }
}

function drawTableRow(doc: PDFKit.PDFDocument, columns: Column[], row: Record<string, string | number>, startX: number) {
  const y = doc.y;
  let x = startX;
  for (const col of columns) {
    doc.text(String(row[col.key] ?? ''), x, y, { width: col.width });
    x += col.width;
  }
  doc.moveDown(0.7);
}

/**
 * Manual row-drawing table layout — pdfkit has no built-in table widget.
 * Summary table (grouped by branch) followed by a page break and the
 * leaderboard ranking, matching the same two-section structure as the CSV
 * and Excel renderers.
 */
export function renderAttendanceReportPdf(data: AttendanceReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const startX = doc.page.margins.left;

    doc.font('Helvetica-Bold').fontSize(18).text('Attendance Report');
    doc.font('Helvetica').fontSize(11).fillColor('#555555').text(`${data.startDate} to ${data.endDate}  ·  ${data.branchFilter}`);
    doc.fillColor('#000000');
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(14).text('Summary');
    doc.moveDown(0.5);

    const summaryColumns: Column[] = [
      { key: 'full_name', label: 'Employee', width: 140 },
      { key: 'branch_name', label: 'Branch', width: 90 },
      { key: 'present_days', label: 'Present', width: 50 },
      { key: 'late_days', label: 'Late', width: 40 },
      { key: 'absent_days', label: 'Absent', width: 50 },
      { key: 'leave_days', label: 'Leave', width: 45 },
      { key: 'points', label: 'Punctuality Score', width: 80 },
    ];
    drawTableHeader(doc, summaryColumns, startX);

    for (const group of data.summaryByBranch) {
      for (const s of group.staff) {
        ensureSpace(doc, summaryColumns, startX);
        drawTableRow(doc, summaryColumns, {
          full_name: s.full_name,
          branch_name: group.branchName,
          present_days: s.present_days,
          late_days: s.late_days,
          absent_days: s.absent_days,
          leave_days: s.leave_days,
          points: s.points,
        }, startX);
      }
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Leaderboard');
    doc.moveDown(0.5);

    const leaderboardColumns: Column[] = [
      { key: 'rank', label: 'Rank', width: 40 },
      { key: 'full_name', label: 'Employee', width: 170 },
      { key: 'branch_name', label: 'Branch', width: 90 },
      { key: 'points', label: 'Punctuality Score', width: 80 },
      { key: 'avg_check_in_time', label: 'Avg Arrival', width: 70 },
    ];
    drawTableHeader(doc, leaderboardColumns, startX);

    data.leaderboard.forEach((s, i) => {
      ensureSpace(doc, leaderboardColumns, startX);
      drawTableRow(doc, leaderboardColumns, {
        rank: i + 1,
        full_name: s.full_name,
        branch_name: s.branch_name ?? '',
        points: s.points,
        avg_check_in_time: s.avg_check_in_time ?? '',
      }, startX);
    });

    doc.end();
  });
}
