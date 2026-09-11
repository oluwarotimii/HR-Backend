"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeriodRange = getPeriodRange;
exports.getCurrentPeriodRange = getCurrentPeriodRange;
exports.getPeriodLabel = getPeriodLabel;
function fmt(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function getPeriodRange(period, offset = 0, now = new Date()) {
    if (period === 'week') {
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + offset * 7);
        const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
        return { startDate: fmt(monday), endDate: fmt(sunday) };
    }
    if (period === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
        return { startDate: fmt(start), endDate: fmt(end) };
    }
    const start = new Date(now.getFullYear() + offset, 0, 1);
    const end = new Date(now.getFullYear() + offset, 11, 31);
    return { startDate: fmt(start), endDate: fmt(end) };
}
function getCurrentPeriodRange(period, now = new Date()) {
    return getPeriodRange(period, 0, now);
}
function getPeriodLabel(period, offset, range) {
    if (period === 'week') {
        if (offset === 0)
            return 'This Week';
        if (offset === -1)
            return 'Last Week';
        return `${Math.abs(offset)} Weeks Ago`;
    }
    if (period === 'month') {
        const d = new Date(`${range.startDate}T00:00:00`);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    const d = new Date(`${range.startDate}T00:00:00`);
    return String(d.getFullYear());
}
//# sourceMappingURL=date-range.util.js.map