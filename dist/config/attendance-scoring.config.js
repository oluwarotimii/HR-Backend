"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTENDANCE_STATUS_POINTS = void 0;
exports.buildPointsCaseSql = buildPointsCaseSql;
exports.ATTENDANCE_STATUS_POINTS = {
    present: 1,
    half_day: 1,
    early_departure: 1,
    'holiday-working': 1,
    late: 0,
    absent: -1,
    leave: 0,
    holiday: 0,
    weekend: 0,
};
function buildPointsCaseSql(columnRef) {
    const whens = Object.entries(exports.ATTENDANCE_STATUS_POINTS)
        .map(([status, points]) => `WHEN '${status}' THEN ${points}`)
        .join(' ');
    return `CASE ${columnRef} ${whens} ELSE 0 END`;
}
//# sourceMappingURL=attendance-scoring.config.js.map