import PayslipGenerator from '../utils/payslip-generator.util';
import PayrollRecordModel from '../models/payroll-record.model';
import PayrollRunModel from '../models/payroll-run.model';
import StaffModel from '../models/staff.model';
export const generatePayslip = async (req, res) => {
    try {
        const { staffId, payrollRunId } = req.params;
        const parsedStaffId = parseInt(Array.isArray(staffId) ? staffId[0] : staffId);
        const parsedPayrollRunId = parseInt(Array.isArray(payrollRunId) ? payrollRunId[0] : payrollRunId);
        if (isNaN(parsedStaffId) || isNaN(parsedPayrollRunId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid staff ID or payroll run ID'
            });
        }
        if (!req.currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const payrollRecord = await PayrollRecordModel.findByStaffIdAndPayrollRun(parsedStaffId, parsedPayrollRunId);
        if (!payrollRecord) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found for this staff and payroll run'
            });
        }
        const payrollRun = await PayrollRunModel.findById(parsedPayrollRunId);
        if (!payrollRun || payrollRun.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Payroll run not found or not completed'
            });
        }
        const currentUserId = req.currentUser.id;
        const currentUserRole = req.currentUser.role_id;
        const staff = await StaffModel.findById(parsedStaffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }
        const staffUserId = staff.user_id;
        if (currentUserId !== staffUserId && ![1, 3].includes(currentUserRole)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this payslip'
            });
        }
        const payslipHtml = await PayslipGenerator.generatePayslipHTMLString(parsedStaffId, parsedPayrollRunId);
        if (!payslipHtml) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate payslip'
            });
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(payslipHtml);
        return;
    }
    catch (error) {
        console.error('Generate payslip error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const downloadPayslip = async (req, res) => {
    try {
        const { staffId, payrollRunId } = req.params;
        const parsedStaffId = parseInt(Array.isArray(staffId) ? staffId[0] : staffId);
        const parsedPayrollRunId = parseInt(Array.isArray(payrollRunId) ? payrollRunId[0] : payrollRunId);
        if (isNaN(parsedStaffId) || isNaN(parsedPayrollRunId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid staff ID or payroll run ID'
            });
        }
        if (!req.currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const payrollRecord = await PayrollRecordModel.findByStaffIdAndPayrollRun(parsedStaffId, parsedPayrollRunId);
        if (!payrollRecord) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found for this staff and payroll run'
            });
        }
        const payrollRun = await PayrollRunModel.findById(parsedPayrollRunId);
        if (!payrollRun || payrollRun.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Payroll run not found or not completed'
            });
        }
        const currentUserId = req.currentUser.id;
        const currentUserRole = req.currentUser.role_id;
        const staff = await StaffModel.findById(parsedStaffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }
        const staffUserId = staff.user_id;
        if (currentUserId !== staffUserId && ![1, 3].includes(currentUserRole)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this payslip'
            });
        }
        const payslipHtml = await PayslipGenerator.generatePayslipHTMLString(parsedStaffId, parsedPayrollRunId);
        if (!payslipHtml) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate payslip'
            });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payslip-${parsedStaffId}-${parsedPayrollRunId}.pdf`);
        res.send(payslipHtml);
        return;
    }
    catch (error) {
        console.error('Download payslip error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
//# sourceMappingURL=payslip.controller.js.map