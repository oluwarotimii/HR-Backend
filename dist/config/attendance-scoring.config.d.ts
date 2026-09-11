import { Attendance } from '../models/attendance.model';
export type ScorableAttendanceStatus = Attendance['status'];
export declare const ATTENDANCE_STATUS_POINTS: Record<ScorableAttendanceStatus, number>;
export declare function buildPointsCaseSql(columnRef: string): string;
//# sourceMappingURL=attendance-scoring.config.d.ts.map