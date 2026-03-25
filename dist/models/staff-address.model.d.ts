export interface StaffAddress {
    id: number;
    staff_id: number;
    address_type: 'permanent' | 'current' | 'emergency_contact';
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    is_primary: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface StaffAddressInput {
    staff_id: number;
    address_type: 'permanent' | 'current' | 'emergency_contact';
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    is_primary?: boolean;
}
export interface StaffAddressUpdate {
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    is_primary?: boolean;
}
declare class StaffAddressModel {
    static tableName: string;
    static findAll(staffId?: number): Promise<StaffAddress[]>;
    static findById(id: number): Promise<StaffAddress | null>;
    static findByStaffId(staffId: number): Promise<StaffAddress[]>;
    static findByType(staffId: number, addressType: 'permanent' | 'current' | 'emergency_contact'): Promise<StaffAddress[]>;
    static create(addressData: StaffAddressInput): Promise<StaffAddress>;
    static update(id: number, addressData: StaffAddressUpdate): Promise<StaffAddress | null>;
    static delete(id: number): Promise<boolean>;
    static setAsPrimary(id: number): Promise<StaffAddress | null>;
}
export default StaffAddressModel;
//# sourceMappingURL=staff-address.model.d.ts.map