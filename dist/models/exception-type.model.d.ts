export interface ExceptionType {
    id: number;
    name: string;
    code: string;
    description?: string;
    icon: string;
    color: string;
    default_start_time?: string;
    default_end_time?: string;
    default_break_duration: number;
    is_active: boolean;
    is_system: boolean;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}
export interface ExceptionTypeInput {
    name: string;
    code: string;
    description?: string;
    icon?: string;
    color?: string;
    default_start_time?: string;
    default_end_time?: string;
    default_break_duration?: number;
    is_active?: boolean;
    is_system?: boolean;
    sort_order?: number;
}
export interface ExceptionTypeUpdate {
    name?: string;
    code?: string;
    description?: string;
    icon?: string;
    color?: string;
    default_start_time?: string;
    default_end_time?: string;
    default_break_duration?: number;
    is_active?: boolean;
    sort_order?: number;
}
declare class ExceptionTypeModel {
    static tableName: string;
    static findAll(activeOnly?: boolean): Promise<ExceptionType[]>;
    static findById(id: number): Promise<ExceptionType | null>;
    static findByCode(code: string): Promise<ExceptionType | null>;
    static create(typeData: ExceptionTypeInput): Promise<ExceptionType>;
    static update(id: number, typeData: ExceptionTypeUpdate): Promise<ExceptionType | null>;
    static delete(id: number): Promise<boolean>;
    static toggleActive(id: number): Promise<ExceptionType | null>;
}
export default ExceptionTypeModel;
//# sourceMappingURL=exception-type.model.d.ts.map