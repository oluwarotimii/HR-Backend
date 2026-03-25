export interface FormField {
    id: number;
    form_id: number;
    field_name: string;
    field_label: string;
    field_type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'dropdown' | 'checkbox' | 'file' | 'phone' | 'address';
    is_required: boolean;
    placeholder?: string;
    help_text?: string;
    validation_rule?: string;
    options?: any;
    field_order: number;
    created_at: Date;
}
export interface FormFieldInput {
    form_id: number;
    field_name: string | null;
    field_label: string | null;
    field_type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'dropdown' | 'checkbox' | 'file' | 'phone' | 'address' | null;
    is_required?: boolean;
    placeholder?: string | null;
    help_text?: string | null;
    validation_rule?: string | null;
    options?: any | null;
    field_order: number;
}
export interface FormFieldUpdate {
    field_name?: string;
    field_label?: string;
    field_type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'dropdown' | 'checkbox' | 'file' | 'phone' | 'address';
    is_required?: boolean;
    placeholder?: string;
    help_text?: string;
    validation_rule?: string;
    options?: any;
    field_order?: number;
}
declare class FormFieldModel {
    static tableName: string;
    static findAll(formId?: number): Promise<FormField[]>;
    static findById(id: number): Promise<FormField | null>;
    static findByFormId(formId: number): Promise<FormField[]>;
    static findByFormAndName(formId: number, fieldName: string): Promise<FormField | null>;
    static create(fieldData: FormFieldInput): Promise<FormField>;
    static update(id: number, fieldData: FormFieldUpdate): Promise<FormField | null>;
    static delete(id: number): Promise<boolean>;
    static deleteByFormId(formId: number): Promise<boolean>;
}
export default FormFieldModel;
//# sourceMappingURL=form-field.model.d.ts.map