export interface StaffSkill {
    id: number;
    staff_id: number;
    skill_name: string;
    proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_of_experience?: number;
    certification_status: 'none' | 'certified' | 'in_progress';
    last_used_date?: Date;
    is_primary: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface StaffSkillInput {
    staff_id: number;
    skill_name: string;
    proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_of_experience?: number;
    certification_status?: 'none' | 'certified' | 'in_progress';
    last_used_date?: Date;
    is_primary?: boolean;
}
export interface StaffSkillUpdate {
    skill_name?: string;
    proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_of_experience?: number;
    certification_status?: 'none' | 'certified' | 'in_progress';
    last_used_date?: Date;
    is_primary?: boolean;
}
declare class StaffSkillModel {
    static tableName: string;
    static findAll(staffId?: number, limit?: number, offset?: number): Promise<{
        skills: StaffSkill[];
        totalCount: number;
    }>;
    static findById(id: number): Promise<StaffSkill | null>;
    static findByStaffAndSkill(staffId: number, skillName: string): Promise<StaffSkill | null>;
    static create(skillData: StaffSkillInput): Promise<StaffSkill>;
    static update(id: number, skillData: StaffSkillUpdate): Promise<StaffSkill | null>;
    static delete(id: number): Promise<boolean>;
    static deleteByStaffAndSkill(staffId: number, skillName: string): Promise<boolean>;
}
export default StaffSkillModel;
//# sourceMappingURL=staff-skill.model.d.ts.map