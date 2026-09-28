"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftSchedulingService = void 0;
const database_1 = require("../config/database");
class ShiftSchedulingService {
    static isLastSaturdayOfMonth(date) {
        if (date.getDay() !== 6)
            return false;
        const nextSaturday = new Date(date);
        nextSaturday.setDate(date.getDate() + 7);
        return nextSaturday.getMonth() !== date.getMonth();
    }
    static async getLastSaturdayResumptionTime() {
        try {
            const [rows] = await database_1.pool.execute(`SELECT last_saturday_resumption_time FROM global_attendance_settings LIMIT 1`);
            return rows.length > 0 ? rows[0].last_saturday_resumption_time : null;
        }
        catch {
            return null;
        }
    }
    static async getEffectiveScheduleForDate(userId, date) {
        try {
            const dateStr = date.toISOString().split('T')[0];
            const [exceptions] = await database_1.pool.execute(`SELECT se.new_start_time, se.new_end_time, se.new_break_duration_minutes, se.exception_type, se.reason
         FROM shift_exceptions se
         WHERE se.user_id = ? AND se.exception_date = ? AND se.status = 'active'`, [userId, dateStr]);
            if (exceptions.length > 0) {
                const exception = exceptions[0];
                return {
                    start_time: exception.new_start_time,
                    end_time: exception.new_end_time,
                    break_duration_minutes: exception.new_break_duration_minutes,
                    schedule_type: `exception_${exception.exception_type}`,
                    schedule_note: exception.reason || `Special schedule for ${exception.exception_type}`
                };
            }
            const [holidays] = await database_1.pool.execute(`SELECT * FROM holidays WHERE date = ? AND (branch_id IS NULL OR branch_id = (SELECT branch_id FROM staff WHERE user_id = ?))`, [dateStr, userId]);
            if (holidays.length > 0) {
                return {
                    start_time: null,
                    end_time: null,
                    break_duration_minutes: 0,
                    schedule_type: 'holiday',
                    schedule_note: `Holiday: ${holidays[0].holiday_name}`
                };
            }
            const [leaveHistory] = await database_1.pool.execute(`SELECT id
         FROM leave_history
         WHERE user_id = ?
           AND ? BETWEEN start_date AND end_date
           AND status = 'approved'
         LIMIT 1`, [userId, dateStr]);
            if (leaveHistory.length > 0) {
                return {
                    start_time: null,
                    end_time: null,
                    break_duration_minutes: 0,
                    schedule_type: 'leave',
                    schedule_note: 'On approved leave'
                };
            }
            const [leaveRequests] = await database_1.pool.execute(`SELECT id
         FROM leave_requests
         WHERE user_id = ?
           AND ? BETWEEN start_date AND end_date
           AND status = 'approved'
           AND (cancelled_by IS NULL OR cancelled_at IS NULL)
         LIMIT 1`, [userId, dateStr]);
            if (leaveRequests.length > 0) {
                return {
                    start_time: null,
                    end_time: null,
                    break_duration_minutes: 0,
                    schedule_type: 'leave',
                    schedule_note: 'On approved leave'
                };
            }
            const [staffDetails] = await database_1.pool.execute(`SELECT branch_id, status FROM staff WHERE user_id = ?`, [userId]);
            if (staffDetails.length > 0) {
                const { branch_id, status } = staffDetails[0];
                if (status === 'on_leave') {
                    return {
                        start_time: null,
                        end_time: null,
                        break_duration_minutes: 0,
                        schedule_type: 'leave',
                        schedule_note: 'Staff status set to On Leave'
                    };
                }
                if (branch_id) {
                    const dayOfWeek = date.getDay();
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const dayName = dayNames[dayOfWeek];
                    const [branchHours] = await database_1.pool.execute(`SELECT start_time, end_time, break_duration_minutes, is_working_day
             FROM branch_working_days
             WHERE branch_id = ? AND day_of_week = ?`, [branch_id, dayName]);
                    if (branchHours.length > 0) {
                        if (branchHours[0].is_working_day) {
                            const branchResult = {
                                start_time: branchHours[0].start_time,
                                end_time: branchHours[0].end_time,
                                break_duration_minutes: branchHours[0].break_duration_minutes || 0,
                                schedule_type: 'branch_default',
                                schedule_note: `Standard ${dayName} hours for branch`
                            };
                            if (dayName === 'saturday' && this.isLastSaturdayOfMonth(date)) {
                                const lastSatTime = await this.getLastSaturdayResumptionTime();
                                if (lastSatTime) {
                                    branchResult.start_time = lastSatTime;
                                    branchResult.schedule_note += ' (Last Saturday - adjusted start time)';
                                }
                            }
                            return branchResult;
                        }
                        else {
                            return {
                                start_time: null,
                                end_time: null,
                                break_duration_minutes: 0,
                                schedule_type: 'non_working_day',
                                schedule_note: `Branch is closed on ${dayName}`
                            };
                        }
                    }
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error getting effective schedule:', error);
            throw error;
        }
    }
    static async calculateAttendanceMetrics(userId, date, checkInTime, checkOutTime, gracePeriodMinutes = 0, existingSchedule) {
        try {
            const schedule = existingSchedule || await this.getEffectiveScheduleForDate(userId, date);
            if (!schedule || !schedule.start_time || !schedule.end_time) {
                return {
                    is_late: null,
                    is_early_departure: null,
                    actual_working_hours: null,
                    scheduled_start_time: null,
                    scheduled_end_time: null,
                    scheduled_break_duration_minutes: 0,
                    status: null
                };
            }
            const [schedStartHours, schedStartMinutes] = schedule.start_time.split(':').map(Number);
            const [schedEndHours, schedEndMinutes] = schedule.end_time.split(':').map(Number);
            const scheduledStartTime = new Date(date);
            scheduledStartTime.setHours(schedStartHours, schedStartMinutes, 0, 0);
            const scheduledEndTime = new Date(date);
            scheduledEndTime.setHours(schedEndHours, schedEndMinutes, 0, 0);
            let isLate = false;
            let status = 'present';
            if (checkInTime) {
                const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
                const checkInDateTime = new Date(date);
                checkInDateTime.setHours(checkInHours, checkInMinutes, 0, 0);
                const gracePeriodMs = gracePeriodMinutes * 60 * 1000;
                const adjustedStartTime = new Date(scheduledStartTime.getTime() + gracePeriodMs);
                isLate = checkInDateTime.getTime() > adjustedStartTime.getTime();
                status = isLate ? 'late' : 'present';
            }
            else {
                status = 'present';
            }
            let isEarlyDeparture = false;
            if (checkOutTime) {
                const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);
                const checkOutDateTime = new Date(date);
                checkOutDateTime.setHours(checkOutHours, checkOutMinutes, 0, 0);
                isEarlyDeparture = checkOutDateTime.getTime() < scheduledEndTime.getTime();
                if (isEarlyDeparture && !isLate && status !== 'late') {
                    status = 'early_departure';
                }
            }
            let actualWorkingHours = null;
            if (checkInTime && checkOutTime) {
                const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
                const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);
                const checkInDateTime = new Date(date);
                checkInDateTime.setHours(checkInHours, checkInMinutes, 0, 0);
                const checkOutDateTime = new Date(date);
                checkOutDateTime.setHours(checkOutHours, checkOutMinutes, 0, 0);
                const diffMs = checkOutDateTime.getTime() - checkInDateTime.getTime();
                let diffHours = diffMs / (1000 * 60 * 60);
                diffHours -= (schedule.break_duration_minutes / 60);
                actualWorkingHours = Math.max(0, parseFloat(diffHours.toFixed(2)));
            }
            return {
                is_late: isLate,
                is_early_departure: isEarlyDeparture,
                actual_working_hours: actualWorkingHours,
                scheduled_start_time: schedule.start_time,
                scheduled_end_time: schedule.end_time,
                scheduled_break_duration_minutes: schedule.break_duration_minutes,
                status
            };
        }
        catch (error) {
            console.error('Error calculating attendance metrics:', error);
            throw error;
        }
    }
    static async updateAttendanceWithScheduleInfo(attendanceId, userId, date, gracePeriodMinutes = 0, existingSchedule) {
        try {
            const [attendanceRecords] = await database_1.pool.execute(`SELECT check_in_time, check_out_time FROM attendance WHERE id = ?`, [attendanceId]);
            if (attendanceRecords.length === 0) {
                throw new Error('Attendance record not found');
            }
            const record = attendanceRecords[0];
            const checkInTime = record.check_in_time;
            const checkOutTime = record.check_out_time;
            const metrics = await this.calculateAttendanceMetrics(userId, date, checkInTime, checkOutTime, gracePeriodMinutes, existingSchedule);
            const [result] = await database_1.pool.execute(`UPDATE attendance
         SET scheduled_start_time = ?, scheduled_end_time = ?,
             scheduled_break_duration_minutes = ?, is_late = ?,
             is_early_departure = ?, actual_working_hours = ?,
             status = COALESCE(?, status)
         WHERE id = ?`, [
                metrics.scheduled_start_time,
                metrics.scheduled_end_time,
                metrics.scheduled_break_duration_minutes,
                metrics.is_late,
                metrics.is_early_departure,
                metrics.actual_working_hours,
                metrics.status,
                attendanceId
            ]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error('Error updating attendance with schedule info:', error);
            throw error;
        }
    }
    static async processAttendanceForDate(userId, date) {
        try {
            const [attendanceRecords] = await database_1.pool.execute(`SELECT id, check_in_time, check_out_time
         FROM attendance
         WHERE user_id = ? AND date = ?`, [userId, date.toISOString().split('T')[0]]);
            if (attendanceRecords.length > 0) {
                const record = attendanceRecords[0];
                await this.updateAttendanceWithScheduleInfo(record.id, userId, date, 0);
                await this.correctAttendanceStatusForDate(userId, date);
            }
        }
        catch (error) {
            console.error('Error processing attendance for date:', error);
            throw error;
        }
    }
    static async correctAttendanceStatusForDate(userId, date) {
        const dateStr = date.toISOString().split('T')[0];
        const [rows] = await database_1.pool.execute(`SELECT id, status, check_in_time FROM attendance WHERE user_id = ? AND date = ?`, [userId, dateStr]);
        if (rows.length === 0)
            return false;
        const record = rows[0];
        const correction = await this.deriveAttendanceCorrection(userId, date, record.status, record.check_in_time);
        if (!correction)
            return false;
        await database_1.pool.execute(`UPDATE attendance SET status = ?, notes = ? WHERE id = ?`, [correction.status, correction.note, record.id]);
        return true;
    }
    static async deriveAttendanceCorrection(userId, date, currentStatus, checkInTime) {
        const autoMarkedStatuses = ['absent', 'weekend', 'off', 'present', 'late', 'early_departure'];
        if (checkInTime || !autoMarkedStatuses.includes(currentStatus)) {
            return null;
        }
        const effectiveSchedule = await this.getEffectiveScheduleForDate(userId, date);
        let correctStatus;
        let note;
        if (effectiveSchedule?.schedule_type === 'holiday') {
            correctStatus = 'holiday';
            note = effectiveSchedule.schedule_note;
        }
        else if (effectiveSchedule?.schedule_type === 'leave') {
            correctStatus = 'leave';
            note = effectiveSchedule.schedule_note;
        }
        else if (!effectiveSchedule || !effectiveSchedule.start_time || !effectiveSchedule.end_time) {
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            correctStatus = isWeekend ? 'weekend' : 'off';
            note = effectiveSchedule?.schedule_note || (isWeekend ? 'Weekend' : 'Off day');
        }
        else {
            return null;
        }
        if (correctStatus === currentStatus)
            return null;
        return { status: correctStatus, note };
    }
    static async bulkCorrectPastAbsences(startDate, endDate, dryRun) {
        const [rows] = await database_1.pool.execute(`SELECT id, user_id, date, status FROM attendance
       WHERE status IN ('absent', 'present', 'late', 'early_departure') AND check_in_time IS NULL AND date BETWEEN ? AND ?
       ORDER BY date ASC`, [startDate, endDate]);
        let corrected = 0;
        const changes = [];
        for (const record of rows) {
            const date = new Date(record.date);
            const correction = await this.deriveAttendanceCorrection(record.user_id, date, record.status, null);
            if (!correction)
                continue;
            corrected++;
            if (changes.length < 500) {
                changes.push({
                    userId: record.user_id,
                    date: date.toISOString().split('T')[0],
                    from: record.status,
                    to: correction.status,
                });
            }
            if (!dryRun) {
                await database_1.pool.execute(`UPDATE attendance SET status = ?, notes = ? WHERE id = ?`, [correction.status, correction.note, record.id]);
            }
        }
        return { totalChecked: rows.length, corrected, changes };
    }
    static async bulkCorrectLateOnNonWorkingDays(startDate, endDate, dryRun) {
        const [rows] = await database_1.pool.execute(`SELECT id, user_id, date, status FROM attendance
       WHERE status IN ('present', 'late', 'early_departure') AND check_in_time IS NOT NULL AND date BETWEEN ? AND ?
       ORDER BY date ASC`, [startDate, endDate]);
        let corrected = 0;
        const changes = [];
        for (const record of rows) {
            const date = new Date(record.date);
            const effectiveSchedule = await this.getEffectiveScheduleForDate(record.user_id, date);
            const stillAGenuineWorkday = effectiveSchedule?.start_time &&
                effectiveSchedule?.end_time &&
                effectiveSchedule.schedule_type !== 'holiday' &&
                effectiveSchedule.schedule_type !== 'leave';
            if (stillAGenuineWorkday)
                continue;
            let correctStatus;
            let note;
            if (effectiveSchedule?.schedule_type === 'holiday') {
                correctStatus = 'holiday';
                note = effectiveSchedule.schedule_note;
            }
            else if (effectiveSchedule?.schedule_type === 'leave') {
                correctStatus = 'leave';
                note = effectiveSchedule.schedule_note;
            }
            else {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                correctStatus = isWeekend ? 'weekend' : 'off';
                note = effectiveSchedule?.schedule_note || (isWeekend ? 'Weekend' : 'Off day');
            }
            if (correctStatus === record.status)
                continue;
            corrected++;
            if (changes.length < 500) {
                changes.push({
                    userId: record.user_id,
                    date: date.toISOString().split('T')[0],
                    from: record.status,
                    to: correctStatus,
                });
            }
            if (!dryRun) {
                await database_1.pool.execute(`UPDATE attendance SET status = ?, is_late = NULL, is_early_departure = NULL, notes = ? WHERE id = ?`, [correctStatus, `Corrected: ${note} — this was not actually a scheduled working day`, record.id]);
            }
        }
        return { totalChecked: rows.length, corrected, changes };
    }
    static async reprocessLastSaturdayAttendance(specificDate) {
        const dates = [];
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        for (let year = currentYear - 1; year <= currentYear; year++) {
            const maxMonth = year === currentYear ? currentMonth : 11;
            const minMonth = year === currentYear - 1 ? currentMonth : 0;
            for (let month = minMonth; month <= maxMonth; month++) {
                const lastDay = new Date(year, month + 1, 0);
                for (let day = lastDay.getDate(); day >= 1; day--) {
                    const d = new Date(year, month, day);
                    if (d.getDay() === 6) {
                        dates.push(d.toISOString().split('T')[0]);
                        break;
                    }
                }
            }
        }
        const targetDates = specificDate ? [specificDate] : dates;
        let reprocessed = 0;
        for (const dateStr of targetDates) {
            const date = new Date(dateStr + 'T00:00:00');
            const [records] = await database_1.pool.execute(`SELECT a.id, a.user_id, a.check_in_time, a.check_out_time
         FROM attendance a
         WHERE a.date = ? AND a.check_in_time IS NOT NULL`, [dateStr]);
            for (const record of records) {
                await this.updateAttendanceWithScheduleInfo(record.id, record.user_id, date, 0);
                reprocessed++;
            }
        }
        return { reprocessed, dates: targetDates };
    }
}
exports.ShiftSchedulingService = ShiftSchedulingService;
//# sourceMappingURL=shift-scheduling.service.js.map