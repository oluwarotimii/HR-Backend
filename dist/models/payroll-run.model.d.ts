export interface PayrollRun {
    id: number;
    month: number;
    year: number;
    branch_id: number | null;
    status: 'draft' | 'processing' | 'completed' | 'cancelled';
    run_date: Date;
    total_amount: number | null;
    processed_by: number | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface PayrollRunInput {
    month: number;
    year: number;
    branch_id?: number | null;
    status?: 'draft' | 'processing' | 'completed' | 'cancelled';
    processed_by?: number | null;
    notes?: string | null;
}
export interface PayrollRunUpdate {
    status?: 'draft' | 'processing' | 'completed' | 'cancelled';
    total_amount?: number | null;
    processed_by?: number | null;
    notes?: string | null;
}
declare class PayrollRunModel {
    static tableName: string;
    static findAll(month?: number, year?: number, branchId?: number, status?: string): Promise<PayrollRun[]>;
    static findById(id: number): Promise<PayrollRun | null>;
    static findByMonthYear(month: number, year: number, branchId?: number | null): Promise<PayrollRun | null>;
    static create(payrollRunData: PayrollRunInput): Promise<PayrollRun>;
    static update(id: number, payrollRunData: PayrollRunUpdate): Promise<PayrollRun | null>;
    static delete(id: number): Promise<boolean>;
    static updateStatus(id: number, status: 'draft' | 'processing' | 'completed' | 'cancelled'): Promise<PayrollRun | null>;
}
export default PayrollRunModel;
//# sourceMappingURL=payroll-run.model.d.ts.map