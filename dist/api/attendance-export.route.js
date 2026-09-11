"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const attendance_report_service_1 = require("../services/attendance-report.service");
const attendance_report_csv_util_1 = require("../utils/attendance-report-csv.util");
const attendance_report_excel_service_1 = require("../services/attendance-report-excel.service");
const attendance_report_pdf_service_1 = require("../services/attendance-report-pdf.service");
const router = (0, express_1.Router)();
function parseQuery(req) {
    const { startDate, endDate, branchId } = req.query;
    return {
        startDate,
        endDate,
        branchId: branchId ? Number(branchId) : undefined,
    };
}
router.get('/export', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('attendance:export'), async (req, res) => {
    try {
        const { startDate, endDate, branchId } = parseQuery(req);
        const format = String(req.query.format || 'csv').toLowerCase();
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }
        if (!['csv', 'pdf', 'excel'].includes(format)) {
            return res.status(400).json({ success: false, message: 'format must be one of csv, pdf, excel' });
        }
        const data = await (0, attendance_report_service_1.buildAttendanceReportData)(startDate, endDate, branchId);
        const filenameBase = `attendance-report-${startDate}-to-${endDate}`;
        if (format === 'csv') {
            const csv = (0, attendance_report_csv_util_1.renderAttendanceReportCsv)(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
            return res.send(csv);
        }
        if (format === 'excel') {
            const buffer = await (0, attendance_report_excel_service_1.renderAttendanceReportExcel)(data);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
            return res.send(buffer);
        }
        const buffer = await (0, attendance_report_pdf_service_1.renderAttendanceReportPdf)(data);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
        return res.send(buffer);
    }
    catch (error) {
        console.error('Error exporting attendance report:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.get('/leaderboard', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('attendance:export'), async (req, res) => {
    try {
        const { startDate, endDate, branchId } = parseQuery(req);
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }
        const data = await (0, attendance_report_service_1.buildAttendanceReportData)(startDate, endDate, branchId);
        return res.json({
            success: true,
            data: {
                startDate,
                endDate,
                branchFilter: data.branchFilter,
                leaderboard: data.leaderboard,
            },
        });
    }
    catch (error) {
        console.error('Error fetching attendance leaderboard preview:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=attendance-export.route.js.map