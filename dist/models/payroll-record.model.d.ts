export interface PayrollRecord {
    id: number;
    payroll_run_id: number;
    staff_id: number;
    earnings: any;
    deductions: any;
    gross_pay: number;
    total_deductions: number;
    net_pay: number;
    processed_at: Date;
    created_at: Date;
    updated_at: Date;
}
export interface PayrollRecordInput {
    payroll_run_id: number;
    staff_id: number;
    earnings: any;
    deductions: any;
    gross_pay: number;
    total_deductions: number;
    net_pay: number;
}
export interface PayrollRecordUpdate {
    earnings?: any;
    deductions?: any;
    gross_pay?: number;
    total_deductions?: number;
    net_pay?: number;
}
declare class PayrollRecordModel {
    static tableName: string;
    static findAll(payrollRunId?: number, staffId?: number): Promise<PayrollRecord[]>;
    static findById(id: number): Promise<PayrollRecord | null>;
    static findByPayrollRunId(payrollRunId: number): Promise<PayrollRecord[]>;
    static findByStaffId(staffId: number): Promise<PayrollRecord[]>;
    static findByStaffIdAndPayrollRun(staffId: number, payrollRunId: number): Promise<PayrollRecord | null>;
    static create(payrollRecordData: PayrollRecordInput): Promise<PayrollRecord>;
    static update(id: number, payrollRecordData: PayrollRecordUpdate): Promise<PayrollRecord | null>;
    static delete(id: number): Promise<boolean>;
    static calculateTotalAmountForRun(payrollRunId: number): Promise<number>;
}
export default PayrollRecordModel;
//# sourceMappingURL=payroll-record.model.d.ts.map