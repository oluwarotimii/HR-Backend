interface PayslipData {
    staff: any;
    user: any;
    branch: any;
    payrollRecord: any;
    payrollRun: any;
    earnings: Record<string, number>;
    deductions: Record<string, number>;
    grossPay: number;
    totalDeductions: number;
    netPay: number;
    month: number;
    year: number;
}
declare class PayslipGenerator {
    static generatePayslipData(staffId: number, payrollRunId: number): Promise<PayslipData | null>;
    static generatePayslipHTML(data: PayslipData): string;
    static generatePayslipHTMLString(staffId: number, payrollRunId: number): Promise<string | null>;
}
export default PayslipGenerator;
//# sourceMappingURL=payslip-generator.util.d.ts.map