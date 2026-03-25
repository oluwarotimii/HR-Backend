export declare class AnalyticsService {
    static calculateAttendanceMetrics(startDate: string, endDate: string, branchId?: number, departmentId?: number): Promise<any>;
    static calculateLeaveMetrics(startDate: string, endDate: string, branchId?: number, departmentId?: number): Promise<any>;
    static calculatePayrollMetrics(startDate: string, endDate: string, branchId?: number, departmentId?: number): Promise<any>;
    static calculatePerformanceMetrics(startDate: string, endDate: string, branchId?: number, departmentId?: number): Promise<any>;
    static calculateStaffMetrics(startDate: string, endDate: string, branchId?: number, departmentId?: number): Promise<{
        newHires: any;
        terminations: any;
        activeEmployees: any;
    }>;
    static saveCalculatedMetric(metricName: string, metricCategory: string, metricValue: number, metricUnit: string, calculatedForPeriod: string, calculatedFrom: Date, calculatedTo: Date, branchId?: number, departmentId?: number): Promise<any>;
    static getCalculatedMetrics(metricCategory?: string, startDate?: string, endDate?: string, branchId?: number, departmentId?: number): Promise<any>;
    static calculateAndStoreAllMetrics(startDate: string, endDate: string, branchId?: number, departmentId?: number): Promise<{
        success: boolean;
        message: string;
        calculatedMetrics: {
            attendance: any;
            leave: any;
            payroll: any;
            performance: any;
            staff: {
                newHires: any;
                terminations: any;
                activeEmployees: any;
            };
        };
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map