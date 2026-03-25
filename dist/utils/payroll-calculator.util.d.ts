interface PayrollCalculationResult {
    staff_id: number;
    earnings: Record<string, number>;
    deductions: Record<string, number>;
    gross_pay: number;
    total_deductions: number;
    net_pay: number;
}
export interface PayrollCalculationInput {
    staff_id: number;
    paymentStructures: any[];
    month: number;
    year: number;
}
declare class PayrollCalculator {
    static calculateStaffPayroll(input: PayrollCalculationInput): Promise<PayrollCalculationResult>;
    static calculatePayrollForStaff(staffIds: number[], month: number, year: number): Promise<PayrollCalculationResult[]>;
    private static evaluateFormula;
    static validatePaymentStructures(paymentStructures: any[]): {
        isValid: boolean;
        errors: string[];
    };
}
export default PayrollCalculator;
//# sourceMappingURL=payroll-calculator.util.d.ts.map