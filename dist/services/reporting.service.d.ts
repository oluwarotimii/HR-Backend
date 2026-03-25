export declare class ReportTemplateService {
    static getAllReportTemplates(category?: string): Promise<any>;
    static getReportTemplateById(id: number): Promise<any>;
    static createReportTemplate(name: string, description: string, category: string, queryDefinition: string, parametersSchema: any, outputFormat: string, createdBy: number): Promise<any>;
    static updateReportTemplate(id: number, name?: string, description?: string, category?: string, queryDefinition?: string, parametersSchema?: any, outputFormat?: string, isActive?: boolean): Promise<boolean>;
    static deleteReportTemplate(id: number): Promise<boolean>;
}
export declare class ScheduledReportService {
    static getAllScheduledReports(userId?: number): Promise<any>;
    static getScheduledReportById(id: number): Promise<any>;
    static createScheduledReport(reportTemplateId: number, name: string, description: string, scheduleType: string, scheduleConfig: any, recipients: any[], parameters: any, createdBy: number): Promise<any>;
    private static calculateNextRunDate;
    static updateScheduledReport(id: number, name?: string, description?: string, scheduleType?: string, scheduleConfig?: any, recipients?: any[], parameters?: any): Promise<boolean>;
    static deleteScheduledReport(id: number): Promise<boolean>;
}
//# sourceMappingURL=reporting.service.d.ts.map