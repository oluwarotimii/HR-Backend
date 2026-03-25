import PayrollRunModel from '../models/payroll-run.model';
import PayrollRecordModel from '../models/payroll-record.model';
import StaffModel from '../models/staff.model';
import PayrollCalculator from '../utils/payroll-calculator.util';
import AuditLogModel from '../models/audit-log.model';
export const getAllPayrollRuns = async (req, res) => {
    try {
        const { month, year, branchId, status } = req.query;
        const monthNum = month ? parseInt(month) : undefined;
        const yearNum = year ? parseInt(year) : undefined;
        const branchIdNum = branchId ? parseInt(branchId) : undefined;
        const statusStr = status ? status : undefined;
        const payrollRuns = await PayrollRunModel.findAll(monthNum, yearNum, branchIdNum, statusStr);
        res.json({
            success: true,
            message: 'Payroll runs retrieved successfully',
            data: { payrollRuns }
        });
    }
    catch (error) {
        console.error('Get all payroll runs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const getPayrollRunById = async (req, res) => {
    try {
        const { id } = req.params;
        const payrollRunId = parseInt(Array.isArray(id) ? id[0] : id);
        if (isNaN(payrollRunId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payroll run ID'
            });
        }
        const payrollRun = await PayrollRunModel.findById(payrollRunId);
        if (!payrollRun) {
            return res.status(404).json({
                success: false,
                message: 'Payroll run not found'
            });
        }
        const payrollRecords = await PayrollRecordModel.findByPayrollRunId(payrollRunId);
        return res.json({
            success: true,
            message: 'Payroll run retrieved successfully',
            data: { payrollRun, payrollRecords }
        });
    }
    catch (error) {
        console.error('Get payroll run by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const createPayrollRun = async (req, res) => {
    try {
        const { month, year, branch_id, notes } = req.body;
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }
        if (!req.currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        if (month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: 'Month must be between 1 and 12'
            });
        }
        if (year < 1900 || year > 2100) {
            return res.status(400).json({
                success: false,
                message: 'Year must be between 1900 and 2100'
            });
        }
        const existingRun = await PayrollRunModel.findByMonthYear(month, year, branch_id || null);
        if (existingRun) {
            return res.status(409).json({
                success: false,
                message: 'A payroll run already exists for this month/year and branch'
            });
        }
        const payrollRunData = {
            month,
            year,
            branch_id: branch_id || null,
            status: 'draft',
            processed_by: req.currentUser.id,
            notes: notes || null
        };
        const newPayrollRun = await PayrollRunModel.create({
            month,
            year,
            branch_id: branch_id || null,
            status: 'draft',
            processed_by: req.currentUser.id,
            notes: notes || null
        });
        await AuditLogModel.create({
            user_id: req.currentUser.id,
            action: 'payroll_run.created',
            entity_type: 'payroll_run',
            entity_id: newPayrollRun.id,
            before_data: null,
            after_data: newPayrollRun,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        return res.status(201).json({
            success: true,
            message: 'Payroll run created successfully',
            data: { payrollRun: newPayrollRun }
        });
    }
    catch (error) {
        console.error('Create payroll run error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const updatePayrollRun = async (req, res) => {
    try {
        const { id } = req.params;
        const payrollRunId = parseInt(Array.isArray(id) ? id[0] : id);
        const { status, notes } = req.body;
        if (isNaN(payrollRunId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payroll run ID'
            });
        }
        const existingPayrollRun = await PayrollRunModel.findById(payrollRunId);
        if (!existingPayrollRun) {
            return res.status(404).json({
                success: false,
                message: 'Payroll run not found'
            });
        }
        const updateData = {};
        if (status !== undefined)
            updateData.status = status;
        if (notes !== undefined)
            updateData.notes = notes;
        const updatedPayrollRun = await PayrollRunModel.update(payrollRunId, updateData);
        if (req.currentUser) {
            await AuditLogModel.create({
                user_id: req.currentUser.id,
                action: 'payroll_run.updated',
                entity_type: 'payroll_run',
                entity_id: payrollRunId,
                before_data: existingPayrollRun,
                after_data: updatedPayrollRun,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
        }
        return res.json({
            success: true,
            message: 'Payroll run updated successfully',
            data: { payrollRun: updatedPayrollRun }
        });
    }
    catch (error) {
        console.error('Update payroll run error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const executePayrollRun = async (req, res) => {
    try {
        const { id } = req.params;
        const payrollRunId = parseInt(Array.isArray(id) ? id[0] : id);
        if (isNaN(payrollRunId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payroll run ID'
            });
        }
        if (!req.currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const payrollRun = await PayrollRunModel.findById(payrollRunId);
        if (!payrollRun) {
            return res.status(404).json({
                success: false,
                message: 'Payroll run not found'
            });
        }
        if (payrollRun.status !== 'draft' && payrollRun.status !== 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Payroll run must be in draft status to execute'
            });
        }
        await PayrollRunModel.updateStatus(payrollRunId, 'processing');
        try {
            let staffMembers;
            if (payrollRun.branch_id) {
                staffMembers = await StaffModel.findByBranch(payrollRun.branch_id);
            }
            else {
                const allStaffResult = await StaffModel.findAll();
                staffMembers = allStaffResult.staff;
            }
            const activeStaff = staffMembers.filter(staff => staff.status === 'active');
            const payrollCalculations = await PayrollCalculator.calculatePayrollForStaff(activeStaff.map(staff => staff.id), payrollRun.month, payrollRun.year);
            for (const calculation of payrollCalculations) {
                await PayrollRecordModel.create({
                    payroll_run_id: payrollRunId,
                    staff_id: calculation.staff_id,
                    earnings: calculation.earnings,
                    deductions: calculation.deductions,
                    gross_pay: calculation.gross_pay,
                    total_deductions: calculation.total_deductions,
                    net_pay: calculation.net_pay
                });
            }
            const totalAmount = await PayrollRecordModel.calculateTotalAmountForRun(payrollRunId);
            await PayrollRunModel.update(payrollRunId, {
                status: 'completed',
                total_amount: totalAmount,
                processed_by: req.currentUser.id
            });
            await AuditLogModel.create({
                user_id: req.currentUser.id,
                action: 'payroll_run.executed',
                entity_type: 'payroll_run',
                entity_id: payrollRunId,
                before_data: { ...payrollRun, status: 'processing' },
                after_data: { ...payrollRun, status: 'completed', total_amount: totalAmount },
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            return res.json({
                success: true,
                message: 'Payroll run executed successfully',
                data: {
                    payrollRun: { ...payrollRun, status: 'completed', total_amount: totalAmount },
                    processedRecordsCount: payrollCalculations.length
                }
            });
        }
        catch (executionError) {
            console.error('Payroll run execution error:', executionError);
            await PayrollRunModel.updateStatus(payrollRunId, 'draft');
            return res.status(500).json({
                success: false,
                message: 'Error executing payroll run, status reset to draft',
                error: executionError instanceof Error ? executionError.message : 'Unknown error'
            });
        }
    }
    catch (error) {
        console.error('Execute payroll run error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const deletePayrollRun = async (req, res) => {
    try {
        const { id } = req.params;
        const payrollRunId = parseInt(Array.isArray(id) ? id[0] : id);
        if (isNaN(payrollRunId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payroll run ID'
            });
        }
        const existingPayrollRun = await PayrollRunModel.findById(payrollRunId);
        if (!existingPayrollRun) {
            return res.status(404).json({
                success: false,
                message: 'Payroll run not found'
            });
        }
        if (existingPayrollRun.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Can only delete payroll runs in draft status'
            });
        }
        const deleted = await PayrollRunModel.delete(payrollRunId);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Payroll run not found'
            });
        }
        if (req.currentUser) {
            await AuditLogModel.create({
                user_id: req.currentUser.id,
                action: 'payroll_run.deleted',
                entity_type: 'payroll_run',
                entity_id: payrollRunId,
                before_data: existingPayrollRun,
                after_data: null,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
        }
        return res.json({
            success: true,
            message: 'Payroll run deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete payroll run error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
//# sourceMappingURL=payroll-run.controller.js.map