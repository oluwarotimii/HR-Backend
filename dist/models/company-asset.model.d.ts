export interface CompanyAsset {
    id: number;
    asset_tag: string;
    asset_name: string;
    asset_type: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    specifications?: string;
    purchase_date?: Date;
    warranty_expiry_date?: Date;
    asset_condition: 'excellent' | 'good' | 'fair' | 'poor';
    asset_status: 'available' | 'assigned' | 'maintenance' | 'disposed';
    assigned_to_staff_id?: number;
    assigned_date?: Date;
    returned_date?: Date;
    asset_image?: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}
export interface CompanyAssetInput {
    asset_tag: string;
    asset_name: string;
    asset_type: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    specifications?: string;
    purchase_date?: Date;
    warranty_expiry_date?: Date;
    asset_condition?: 'excellent' | 'good' | 'fair' | 'poor';
    asset_status?: 'available' | 'assigned' | 'maintenance' | 'disposed';
    assigned_to_staff_id?: number;
    assigned_date?: Date;
    asset_image?: string;
    notes?: string;
}
export interface CompanyAssetUpdate {
    asset_name?: string;
    asset_type?: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    specifications?: string;
    warranty_expiry_date?: Date;
    asset_condition?: 'excellent' | 'good' | 'fair' | 'poor';
    asset_status?: 'available' | 'assigned' | 'maintenance' | 'disposed';
    assigned_to_staff_id?: number;
    assigned_date?: Date;
    returned_date?: Date;
    asset_image?: string;
    notes?: string;
}
declare class CompanyAssetModel {
    static tableName: string;
    static findAll(limit?: number, offset?: number, assetStatus?: 'available' | 'assigned' | 'maintenance' | 'disposed'): Promise<{
        assets: CompanyAsset[];
        totalCount: number;
    }>;
    static findById(id: number): Promise<CompanyAsset | null>;
    static findByTag(assetTag: string): Promise<CompanyAsset | null>;
    static findByStaff(staffId: number): Promise<CompanyAsset[]>;
    static create(assetData: CompanyAssetInput): Promise<CompanyAsset>;
    static update(id: number, assetData: CompanyAssetUpdate): Promise<CompanyAsset | null>;
    static assignToStaff(assetId: number, staffId: number, assignedDate?: Date): Promise<CompanyAsset | null>;
    static returnFromStaff(assetId: number, returnedDate?: Date): Promise<CompanyAsset | null>;
    static delete(id: number): Promise<boolean>;
}
export default CompanyAssetModel;
//# sourceMappingURL=company-asset.model.d.ts.map