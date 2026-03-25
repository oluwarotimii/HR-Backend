export interface LeaveExpiryRule {
    id: number;
    name: string;
    expire_after_days: number;
    trigger_notification_days: string | null;
    auto_expire_action: 'forfeit' | 'carryover' | 'extend';
    created_at: Date;
    updated_at: Date;
}
export interface LeaveExpiryRuleInput {
    name: string;
    expire_after_days: number;
    trigger_notification_days?: string | null;
    auto_expire_action?: 'forfeit' | 'carryover' | 'extend';
}
export interface LeaveExpiryRuleUpdate {
    name?: string;
    expire_after_days?: number;
    trigger_notification_days?: string | null;
    auto_expire_action?: 'forfeit' | 'carryover' | 'extend';
}
declare class LeaveExpiryRuleModel {
    static tableName: string;
    static findAll(): Promise<LeaveExpiryRule[]>;
    static findById(id: number): Promise<LeaveExpiryRule | null>;
    static findByName(name: string): Promise<LeaveExpiryRule | null>;
    static create(expiryRuleData: LeaveExpiryRuleInput): Promise<LeaveExpiryRule>;
    static update(id: number, expiryRuleData: LeaveExpiryRuleUpdate): Promise<LeaveExpiryRule | null>;
    static delete(id: number): Promise<boolean>;
}
export default LeaveExpiryRuleModel;
//# sourceMappingURL=leave-expiry-rule.model.d.ts.map