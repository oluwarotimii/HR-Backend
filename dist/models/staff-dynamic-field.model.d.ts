export interface StaffDynamicField {
    id: number;
    field_name: string;
    field_label: string;
    field_type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'email' | 'phone';
    field_options?: any;
    required: boolean;
    is_active: boolean;
    created_by?: number;
    updated_by?: number;
    created_at: Date;
    updated_at: Date;
}
export interface StaffDynamicFieldInput {
    field_name: string;
    field_label: string;
    field_type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'email' | 'phone';
    field_options?: any;
    required?: boolean;
    created_by?: number;
}
export interface StaffDynamicFieldUpdate {
    field_label?: string;
    field_type?: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'email' | 'phone';
    field_options?: any;
    required?: boolean;
    is_active?: boolean;
    updated_by?: number;
}
export interface StaffDynamicFieldValue {
    id: number;
    staff_id: number;
    field_id: number;
    field_value: string;
    created_at: Date;
    updated_at: Date;
}
export interface StaffDynamicFieldValueInput {
    staff_id: number;
    field_id: number;
    field_value: string;
}
export interface StaffDynamicFieldValueUpdate {
    field_value: string;
}
declare class StaffDynamicFieldModel {
    static tableName: string;
    static valueTableName: string;
    static findAll(limit?: number, offset?: number, isActive?: boolean): Promise<{
        fields: StaffDynamicField[];
        totalCount: number;
    }>;
    static findById(id: number): Promise<StaffDynamicField | null>;
    static findByName(fieldName: string): Promise<StaffDynamicField | null>;
    static create(fieldData: StaffDynamicFieldInput): Promise<StaffDynamicField>;
    static update(id: number, fieldData: StaffDynamicFieldUpdate): Promise<StaffDynamicField | null>;
    static delete(id: number): Promise<boolean>;
    static getValue(staffId: number, fieldId: number): Promise<StaffDynamicFieldValue | null>;
    static getAllValuesForStaff(staffId: number): Promise<StaffDynamicFieldValue[]>;
    static getAllValuesForField(fieldId: number): Promise<StaffDynamicFieldValue[]>;
    static setValue(valueData: StaffDynamicFieldValueInput): Promise<StaffDynamicFieldValue>;
    static setValuesForStaff(staffId: number, values: {
        fieldId: number;
        fieldValue: string;
    }[]): Promise<StaffDynamicFieldValue[]>;
    static deleteValue(staffId: number, fieldId: number): Promise<boolean>;
}
export default StaffDynamicFieldModel;
//# sourceMappingURL=staff-dynamic-field.model.d.ts.map