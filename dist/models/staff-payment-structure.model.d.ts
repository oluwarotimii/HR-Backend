export interface StaffPaymentStructure {
    id: number;
    staff_id: number;
    payment_type_id: number;
    value: number;
    effective_from: Date;
    effective_to: Date | null;
    created_by: number | null;
    created_at: Date;
    updated_at: Date;
}
export interface StaffPaymentStructureInput {
    staff_id: number;
    payment_type_id: number;
    value: number;
    effective_from: Date;
    effective_to?: Date | null;
    created_by?: number | null;
}
export interface StaffPaymentStructureUpdate {
    value?: number;
    effective_from?: Date;
    effective_to?: Date | null;
}
declare class StaffPaymentStructureModel {
    static tableName: string;
    static findAll(staffId?: number, paymentTypeId?: number): Promise<StaffPaymentStructure[]>;
    static findById(id: number): Promise<StaffPaymentStructure | null>;
    static findByStaffId(staffId: number): Promise<StaffPaymentStructure[]>;
    static findByPaymentTypeId(paymentTypeId: number): Promise<StaffPaymentStructure[]>;
    static findByStaffAndPaymentType(staffId: number, paymentTypeId: number): Promise<StaffPaymentStructure[]>;
    static findActiveForStaff(staffId: number, date?: Date): Promise<StaffPaymentStructure[]>;
    static create(paymentStructureData: StaffPaymentStructureInput): Promise<StaffPaymentStructure>;
    static update(id: number, paymentStructureData: StaffPaymentStructureUpdate): Promise<StaffPaymentStructure | null>;
    static delete(id: number): Promise<boolean>;
    static deactivate(id: number, endDate: Date): Promise<boolean>;
}
export default StaffPaymentStructureModel;
//# sourceMappingURL=staff-payment-structure.model.d.ts.map