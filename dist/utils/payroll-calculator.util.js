import StaffPaymentStructureModel from '../models/staff-payment-structure.model';
import PaymentTypeModel from '../models/payment-type.model';
class PayrollCalculator {
    static async calculateStaffPayroll(input) {
        const { staff_id, paymentStructures, month, year } = input;
        const result = {
            staff_id,
            earnings: {},
            deductions: {},
            gross_pay: 0,
            total_deductions: 0,
            net_pay: 0
        };
        for (const structure of paymentStructures) {
            const { payment_type_details, value } = structure;
            if (!payment_type_details)
                continue;
            const { name, payment_category, calculation_type } = payment_type_details;
            let calculatedValue = 0;
            switch (calculation_type) {
                case 'fixed':
                    calculatedValue = value;
                    break;
                case 'percentage':
                    if (name.toLowerCase().includes('bonus') || name.toLowerCase().includes('allowance')) {
                        const basicSalary = result.earnings['basic_salary'] || 0;
                        calculatedValue = (basicSalary * value) / 100;
                    }
                    else {
                        calculatedValue = (value * 10000) / 100;
                    }
                    break;
                case 'formula':
                    if (payment_type_details.formula) {
                        calculatedValue = this.evaluateFormula(payment_type_details.formula, result, value);
                    }
                    else {
                        calculatedValue = value;
                    }
                    break;
                default:
                    calculatedValue = value;
            }
            if (payment_category === 'earning') {
                result.earnings[name] = calculatedValue;
                result.gross_pay += calculatedValue;
            }
            else if (['deduction', 'tax'].includes(payment_category)) {
                result.deductions[name] = calculatedValue;
                result.total_deductions += calculatedValue;
            }
        }
        result.net_pay = result.gross_pay - result.total_deductions;
        return result;
    }
    static async calculatePayrollForStaff(staffIds, month, year) {
        const results = [];
        for (const staffId of staffIds) {
            const paymentStructures = await StaffPaymentStructureModel.findActiveForStaff(staffId, new Date(year, month - 1, 1));
            const detailedStructures = await Promise.all(paymentStructures.map(async (structure) => {
                const paymentType = await PaymentTypeModel.findById(structure.payment_type_id);
                return {
                    ...structure,
                    payment_type_details: paymentType
                };
            }));
            const calculationInput = {
                staff_id: staffId,
                paymentStructures: detailedStructures,
                month,
                year
            };
            const result = await this.calculateStaffPayroll(calculationInput);
            results.push(result);
        }
        return results;
    }
    static evaluateFormula(formula, currentResults, baseValue) {
        try {
            let processedFormula = formula
                .replace(/\bgross_pay\b/g, currentResults.gross_pay.toString())
                .replace(/\btotal_deductions\b/g, currentResults.total_deductions.toString())
                .replace(/\bbase_value\b/g, baseValue.toString());
            if (formula.includes('*') || formula.includes('/') || formula.includes('+') || formula.includes('-')) {
                const safeFormula = processedFormula.replace(/[^\d+\-*/().]/g, '');
                return eval(safeFormula);
            }
            return baseValue;
        }
        catch (error) {
            console.error('Error evaluating formula:', formula, error);
            return baseValue;
        }
    }
    static validatePaymentStructures(paymentStructures) {
        const errors = [];
        for (const structure of paymentStructures) {
            if (structure.value < 0) {
                errors.push(`Payment structure ${structure.id} has negative value`);
            }
            if (!structure.payment_type_details) {
                errors.push(`Payment structure ${structure.id} missing payment type details`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
export default PayrollCalculator;
//# sourceMappingURL=payroll-calculator.util.js.map