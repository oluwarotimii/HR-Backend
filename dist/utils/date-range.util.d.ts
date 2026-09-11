export type LeaderboardPeriod = 'week' | 'month' | 'year';
export interface DateRange {
    startDate: string;
    endDate: string;
}
export declare function getPeriodRange(period: LeaderboardPeriod, offset?: number, now?: Date): DateRange;
export declare function getCurrentPeriodRange(period: LeaderboardPeriod, now?: Date): DateRange;
export declare function getPeriodLabel(period: LeaderboardPeriod, offset: number, range: DateRange): string;
//# sourceMappingURL=date-range.util.d.ts.map