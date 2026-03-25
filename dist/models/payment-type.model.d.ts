export interface PaymentType {
    id: number;
    name: string;
    payment_category: 'earning' | 'deduction' | 'tax' | 'benefit';
    calculation_type: 'fixed' | 'percentage' | 'formula';
    formula: string | null;
    applies_to_all: boolean;
    created_by: number | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface PaymentTypeInput {
    name: string;
    payment_category: 'earning' | 'deduction' | 'tax' | 'benefit';
    calculation_type: 'fixed' | 'percentage' | 'formula';
    formula?: string | null;
    applies_to_all?: boolean;
    created_by?: number | null;
}
export interface PaymentTypeUpdate {
    name?: string;
    payment_category?: 'earning' | 'deduction' | 'tax' | 'benefit';
    calculation_type?: 'fixed' | 'percentage' | 'formula';
    formula?: string | null;
    applies_to_all?: boolean;
    is_active?: boolean;
}
declare class PaymentTypeModel {
    static tableName: string;
    static findAll(): Promise<PaymentType[]>;
    static findById(id: number): Promise<PaymentType | null>;
    static findByName(name: string): Promise<PaymentType | null>;
    static findByCategory(category: 'earning' | 'deduction' | 'tax' | 'benefit'): Promise<PaymentType[]>;
    static create(paymentTypeData: PaymentTypeInput): Promise<PaymentType>;
    static update(id: number, paymentTypeData: PaymentTypeUpdate): Promise<PaymentType | null>;
    static delete(id: number): Promise<boolean>;
    static activate(id: number): Promise<boolean>;
}
export default PaymentTypeModel;
//# sourceMappingURL=payment-type.model.d.ts.map