import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

/**
 * Service for handling dynamic shift scheduling and attendance logic
 */
export class ShiftSchedulingService {
  /**
   * Check if a given date is the last Saturday of its month
   */
  static isLastSaturdayOfMonth(date: Date): boolean {
    if (date.getDay() !== 6) return false;
    const nextSaturday = new Date(date);
    nextSaturday.setDate(date.getDate() + 7);
    return nextSaturday.getMonth() !== date.getMonth();
  }

  /**
   * Get the global last Saturday resumption time setting
   */
  static async getLastSaturdayResumptionTime(): Promise<string | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT last_saturday_resumption_time FROM global_attendance_settings LIMIT 1`
      );
      return rows.length > 0 ? rows[0].last_saturday_resumption_time : null;
    } catch {
      return null;
    }
  }

  /**
   * Get the effective schedule for a user on a specific date
   */
  static async getEffectiveScheduleForDate(userId: number, date: Date): Promise<{
    start_time: string | null;
    end_time: string | null;
    break_duration_minutes: number;
    schedule_type: string;
    schedule_note: string;
  } | null> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // First, check for any shift exceptions on this specific date
      const [exceptions]: any = await pool.execute(
        `SELECT se.new_start_time, se.new_end_time, se.new_break_duration_minutes, se.exception_type, se.reason
         FROM shift_exceptions se
         WHERE se.user_id = ? AND se.exception_date = ? AND se.status = 'active'`,
        [userId, dateStr]
      );

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

      // Note: last Saturday resumption time override is intentionally NOT applied
      // to shift exceptions, since an exception is an explicit override.

      // Next, check if it's a holiday
      // If it's a holiday and we didn't find an active exception above, they shouldn't work.
      const [holidays]: any = await pool.execute(
        `SELECT * FROM holidays WHERE date = ? AND (branch_id IS NULL OR branch_id = (SELECT branch_id FROM staff WHERE user_id = ?))`,
        [dateStr, userId]
      );

      if (holidays.length > 0) {
        return {
          start_time: null,
          end_time: null,
          break_duration_minutes: 0,
          schedule_type: 'holiday',
          schedule_note: `Holiday: ${holidays[0].holiday_name}`
        };
      }

      // Next, check if user is on approved leave for this date.
      // This is needed so staff dashboards and check-in logic can correctly show/deny work on leave days.
      // Note: leave can be represented in either leave_history (approved) or leave_requests (approved & not cancelled).
      const [leaveHistory]: any = await pool.execute(
        `SELECT id
         FROM leave_history
         WHERE user_id = ?
           AND ? BETWEEN start_date AND end_date
           AND status = 'approved'
         LIMIT 1`,
        [userId, dateStr]
      );

      if (leaveHistory.length > 0) {
        return {
          start_time: null,
          end_time: null,
          break_duration_minutes: 0,
          schedule_type: 'leave',
          schedule_note: 'On approved leave'
        };
      }

      const [leaveRequests]: any = await pool.execute(
        `SELECT id
         FROM leave_requests
         WHERE user_id = ?
           AND ? BETWEEN start_date AND end_date
           AND status = 'approved'
           AND (cancelled_by IS NULL OR cancelled_at IS NULL)
         LIMIT 1`,
        [userId, dateStr]
      );

      if (leaveRequests.length > 0) {
        return {
          start_time: null,
          end_time: null,
          break_duration_minutes: 0,
          schedule_type: 'leave',
          schedule_note: 'On approved leave'
        };
      }

      // Check for branch time mapping override (staff-specific or department-wide)
      // If a mapping exists, use that branch's working days, overriding personal shifts and branch default
      const [staffBranchDept]: any = await pool.execute(
        `SELECT s.branch_id, d.id AS department_id FROM staff s
         LEFT JOIN departments d ON d.name = s.department
         WHERE s.user_id = ?`,
        [userId]
      );
      if (staffBranchDept.length > 0) {
        const [staffRows]: any = await pool.execute(
          `SELECT id FROM staff WHERE user_id = ? LIMIT 1`,
          [userId]
        );
        if (staffRows.length > 0) {
          const staffId = staffRows[0].id;
          const [mappings]: any = await pool.execute(
            `SELECT branch_id, staff_id FROM staff_branch_time_mappings
             WHERE staff_id = ? OR (department_id = ? AND department_id IS NOT NULL)
             ORDER BY staff_id DESC LIMIT 1`,
            [staffId, staffBranchDept[0].department_id]
          );
          if (mappings.length > 0) {
            const mappedBranchId = mappings[0].branch_id;
            const dayOfWeek = date.getDay();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayNames[dayOfWeek];
            const [branchHours]: any = await pool.execute(
              `SELECT start_time, end_time, break_duration_minutes, is_working_day
               FROM branch_working_days
               WHERE branch_id = ? AND day_of_week = ?`,
              [mappedBranchId, dayName]
            );
            if (branchHours.length > 0 && branchHours[0].is_working_day) {
              return {
                start_time: branchHours[0].start_time,
                end_time: branchHours[0].end_time,
                break_duration_minutes: branchHours[0].break_duration_minutes || 0,
                schedule_type: 'branch_time_mapping',
                schedule_note: `Time mapped from branch #${mappedBranchId}`
              };
            }
          }
        }
      }

      // Next, check for any active shift assignments for this user
      // Support for multiple assignments - we now look for ALL active assignments and find the one that matches the day
      const [assignments]: any = await pool.execute(
        `SELECT esa.custom_start_time, esa.custom_end_time, esa.custom_break_duration_minutes,
                st.start_time as template_start_time, st.end_time as template_end_time,
                st.break_duration_minutes as template_break_duration_minutes,
                st.recurrence_pattern, st.recurrence_days, st.name as template_name,
                esa.id as assignment_id, esa.recurrence_pattern as assignment_recurrence_pattern,
                esa.recurrence_days as assignment_recurrence_days, esa.recurrence_day_of_week
         FROM employee_shift_assignments esa
         LEFT JOIN shift_templates st ON esa.shift_template_id = st.id
         WHERE esa.user_id = ?
           AND esa.status = 'active'
           AND ? BETWEEN esa.effective_from AND COALESCE(esa.effective_to, '9999-12-31')`,
        [userId, dateStr]
      );

      if (assignments.length > 0) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek];

        // Helper function to get days from assignment
        const getDaysFromAssignment = (
          recurrencePattern: string,
          recurrenceDays: string | null,
          recurrenceDayOfWeek: string | null
        ): string[] => {
          if (!recurrencePattern || recurrencePattern === 'none' || recurrencePattern === 'daily') {
            return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          }
          if (recurrencePattern === 'weekly') {
            if (recurrenceDays) {
              try {
                const parsed = JSON.parse(recurrenceDays);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            }
            if (recurrenceDayOfWeek) {
              return [recurrenceDayOfWeek];
            }
            return [];
          }
          if (recurrencePattern === 'monthly') {
            if (recurrenceDayOfWeek) {
              return [recurrenceDayOfWeek];
            }
            return [];
          }
          return [];
        };

        // Find the assignment that matches this specific day
        for (const assignment of assignments) {
          const recurrencePattern = assignment.assignment_recurrence_pattern || assignment.recurrence_pattern || 'none';
          const recurrenceDays = assignment.assignment_recurrence_days || assignment.recurrence_days;
          const recurrenceDayOfWeek = assignment.recurrence_day_of_week;

          const assignedDays = getDaysFromAssignment(recurrencePattern, recurrenceDays, recurrenceDayOfWeek);

          // Check if this assignment includes the current day
          if (assignedDays.length > 0 && !assignedDays.includes(dayName) && !assignedDays.includes(dayOfWeek.toString())) {
            continue; // This assignment doesn't cover this day, try next one
          }

          // Found a matching assignment for this day
          const assignmentResult = {
            start_time: assignment.custom_start_time || assignment.template_start_time,
            end_time: assignment.custom_end_time || assignment.template_end_time,
            break_duration_minutes: assignment.custom_break_duration_minutes || assignment.template_break_duration_minutes || 0,
            schedule_type: `assignment_${assignment.assignment_id}_${recurrencePattern}`,
            schedule_note: assignment.template_name || `Shift assignment ${assignment.assignment_id}`
          } as {
            start_time: string | null;
            end_time: string | null;
            break_duration_minutes: number;
            schedule_type: string;
            schedule_note: string;
          };

          // Apply last Saturday resumption time override
          if (dayName === 'saturday' && this.isLastSaturdayOfMonth(date)) {
            const lastSatTime = await this.getLastSaturdayResumptionTime();
            if (lastSatTime) {
              assignmentResult.start_time = lastSatTime;
              assignmentResult.schedule_note += ' (Last Saturday - adjusted start time)';
            }
          }

          return assignmentResult;
        }

        // If we ran through all assignments and none matched the day pattern
        return {
          start_time: null,
          end_time: null,
          break_duration_minutes: 0,
          schedule_type: 'non_working_day',
          schedule_note: 'Non-working day based on recurrence patterns'
        };
      }

      // Next, check for any shift timings assigned to this user (Multi-shift support without migrations)
      const [shiftTimings]: any = await pool.execute(
        `SELECT shift_name, start_time, end_time, override_branch_id
         FROM shift_timings
         WHERE user_id = ? 
           AND effective_from <= ? 
           AND (effective_to IS NULL OR effective_to >= ?)
         ORDER BY id DESC`,
        [userId, dateStr, dateStr]
      );

      if (shiftTimings.length > 0) {
        const dayOfWeek = date.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek];

        for (const shift of shiftTimings) {
          // Check if shift_name contains day constraints like "[monday,tuesday]"
          const dayMatch = shift.shift_name.match(/\[(.*?)\]/);
          if (dayMatch) {
            const days = dayMatch[1].split(',').map((d: string) => d.trim().toLowerCase());
            // Support both full day names and indices if needed
            if (!days.includes(dayName) && !days.includes(dayOfWeek.toString())) {
              continue; // Day doesn't match, try next shift timing
            }
          }

          // Found a matching shift timing
          const shiftTimingResult = {
            start_time: shift.start_time,
            end_time: shift.end_time,
            break_duration_minutes: 0,
            schedule_type: 'multi_shift_timing',
            schedule_note: shift.shift_name
          } as {
            start_time: string | null;
            end_time: string | null;
            break_duration_minutes: number;
            schedule_type: string;
            schedule_note: string;
          };

          // Apply last Saturday resumption time override
          if (dayName === 'saturday' && this.isLastSaturdayOfMonth(date)) {
            const lastSatTime = await this.getLastSaturdayResumptionTime();
            if (lastSatTime) {
              shiftTimingResult.start_time = lastSatTime;
              shiftTimingResult.schedule_note += ' (Last Saturday - adjusted start time)';
            }
          }

          return shiftTimingResult;
        }
      }

      // Finally, fall back to branch working hours if no specific user assignment exists
      const [staffDetails]: any = await pool.execute(
        `SELECT branch_id, status FROM staff WHERE user_id = ?`,
        [userId]
      );

      if (staffDetails.length > 0) {
        const { branch_id, status } = staffDetails[0];

        // NEW: If staff status is explicitly set to 'on_leave', treat as leave
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

          const [branchHours]: any = await pool.execute(
            `SELECT start_time, end_time, break_duration_minutes, is_working_day
             FROM branch_working_days
             WHERE branch_id = ? AND day_of_week = ?`,
            [branch_id, dayName]
          );

          if (branchHours.length > 0) {
            if (branchHours[0].is_working_day) {
              const branchResult = {
                start_time: branchHours[0].start_time,
                end_time: branchHours[0].end_time,
                break_duration_minutes: branchHours[0].break_duration_minutes || 0,
                schedule_type: 'branch_default',
                schedule_note: `Standard ${dayName} hours for branch`
              } as {
                start_time: string | null;
                end_time: string | null;
                break_duration_minutes: number;
                schedule_type: string;
                schedule_note: string;
              };

              // Apply last Saturday resumption time override
              if (dayName === 'saturday' && this.isLastSaturdayOfMonth(date)) {
                const lastSatTime = await this.getLastSaturdayResumptionTime();
                if (lastSatTime) {
                  branchResult.start_time = lastSatTime;
                  branchResult.schedule_note += ' (Last Saturday - adjusted start time)';
                }
              }

              return branchResult;
            } else {
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

      // If no specific schedule found and no branch default, return null
      return null;
    } catch (error) {
      console.error('Error getting effective schedule:', error);
      throw error;
    }
  }

  /**
   * Calculate attendance metrics based on the effective schedule
   */
  static async calculateAttendanceMetrics(
    userId: number,
    date: Date,
    checkInTime: string | null,
    checkOutTime: string | null,
    gracePeriodMinutes: number = 0,
    existingSchedule?: any
  ): Promise<{
    is_late: boolean | null;
    is_early_departure: boolean | null;
    actual_working_hours: number | null;
    scheduled_start_time: string | null;
    scheduled_end_time: string | null;
    scheduled_break_duration_minutes: number;
    status: 'present' | 'late' | 'early_departure' | null;
  }> {
    try {
      // Get the effective schedule for this date (use pre-fetched if available)
      const schedule = existingSchedule || await this.getEffectiveScheduleForDate(userId, date);

      if (!schedule || !schedule.start_time || !schedule.end_time) {
        // If no schedule exists for this date, the employee is not expected to work
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

      // Parse the scheduled times
      const [schedStartHours, schedStartMinutes] = schedule.start_time.split(':').map(Number);
      const [schedEndHours, schedEndMinutes] = schedule.end_time.split(':').map(Number);

      const scheduledStartTime = new Date(date);
      scheduledStartTime.setHours(schedStartHours, schedStartMinutes, 0, 0);

      const scheduledEndTime = new Date(date);
      scheduledEndTime.setHours(schedEndHours, schedEndMinutes, 0, 0);

      // Calculate late arrival
      let isLate = false;
      let status: 'present' | 'late' | 'early_departure' = 'present';
      
      if (checkInTime) {
        const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
        const checkInDateTime = new Date(date);
        checkInDateTime.setHours(checkInHours, checkInMinutes, 0, 0);

        // Apply grace period - late only if after grace period
        const gracePeriodMs = gracePeriodMinutes * 60 * 1000;
        const adjustedStartTime = new Date(scheduledStartTime.getTime() + gracePeriodMs);

        // Consider late if arrived after scheduled start time (with grace period)
        isLate = checkInDateTime.getTime() > adjustedStartTime.getTime();
        status = isLate ? 'late' : 'present';
      } else {
        // No check-in means we can't determine status from check-in
        status = 'present';
      }

      // Calculate early departure
      let isEarlyDeparture = false;
      if (checkOutTime) {
        const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);
        const checkOutDateTime = new Date(date);
        checkOutDateTime.setHours(checkOutHours, checkOutMinutes, 0, 0);

        // Consider early departure if left before scheduled end time
        isEarlyDeparture = checkOutDateTime.getTime() < scheduledEndTime.getTime();

        // If present but left early, mark as early_departure
        if (isEarlyDeparture && !isLate && status !== 'late') {
          status = 'early_departure';
        }
      }

      // Calculate actual working hours
      let actualWorkingHours = null;
      if (checkInTime && checkOutTime) {
        const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
        const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);

        const checkInDateTime = new Date(date);
        checkInDateTime.setHours(checkInHours, checkInMinutes, 0, 0);

        const checkOutDateTime = new Date(date);
        checkOutDateTime.setHours(checkOutHours, checkOutMinutes, 0, 0);

        // Calculate difference in milliseconds, then convert to hours
        const diffMs = checkOutDateTime.getTime() - checkInDateTime.getTime();
        let diffHours = diffMs / (1000 * 60 * 60);

        // Subtract break time
        diffHours -= (schedule.break_duration_minutes / 60);

        // Ensure we don't have negative working hours
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
    } catch (error) {
      console.error('Error calculating attendance metrics:', error);
      throw error;
    }
  }

  /**
   * Update attendance record with schedule information
   */
  static async updateAttendanceWithScheduleInfo(
    attendanceId: number,
    userId: number,
    date: Date,
    gracePeriodMinutes: number = 0,
    existingSchedule?: any
  ): Promise<boolean> {
    try {
      // Get the attendance record to get check-in/out times
      const [attendanceRecords]: any = await pool.execute(
        `SELECT check_in_time, check_out_time FROM attendance WHERE id = ?`,
        [attendanceId]
      );

      if (attendanceRecords.length === 0) {
        throw new Error('Attendance record not found');
      }

      const record = attendanceRecords[0];
      const checkInTime = record.check_in_time;
      const checkOutTime = record.check_out_time;

      // Calculate attendance metrics based on the effective schedule
      const metrics = await this.calculateAttendanceMetrics(
        userId,
        date,
        checkInTime,
        checkOutTime,
        gracePeriodMinutes,
        existingSchedule
      );

      // Update the attendance record with schedule information
      const [result]: any = await pool.execute(
        `UPDATE attendance
         SET scheduled_start_time = ?, scheduled_end_time = ?,
             scheduled_break_duration_minutes = ?, is_late = ?,
             is_early_departure = ?, actual_working_hours = ?,
             status = COALESCE(?, status)
         WHERE id = ?`,
        [
          metrics.scheduled_start_time,
          metrics.scheduled_end_time,
          metrics.scheduled_break_duration_minutes,
          metrics.is_late,
          metrics.is_early_departure,
          metrics.actual_working_hours,
          metrics.status,
          attendanceId
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating attendance with schedule info:', error);
      throw error;
    }
  }

  /**
   * Process attendance for a specific user and date
   */
  static async processAttendanceForDate(userId: number, date: Date): Promise<void> {
    try {
      // Get the attendance record for this user and date
      const [attendanceRecords]: any = await pool.execute(
        `SELECT id, check_in_time, check_out_time
         FROM attendance
         WHERE user_id = ? AND date = ?`,
        [userId, date.toISOString().split('T')[0]]
      );

      if (attendanceRecords.length > 0) {
        const record = attendanceRecords[0];

        // Update the attendance record with schedule information (no grace period for batch processing)
        await this.updateAttendanceWithScheduleInfo(
          record.id,
          userId,
          date,
          0 // Default grace period for batch processing
        );
      }
    } catch (error) {
      console.error('Error processing attendance for date:', error);
      throw error;
    }
  }

  /**
   * Reprocess attendance for all last Saturday dates
   * Called when the last_saturday_resumption_time global setting is changed
   * to retroactively correct attendance records (late/present status).
   */
  static async reprocessLastSaturdayAttendance(
    specificDate?: string
  ): Promise<{ reprocessed: number; dates: string[] }> {
    const dates: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Collect all last Saturday dates that have already occurred
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

    // If a specific date is provided, only reprocess that one
    const targetDates = specificDate ? [specificDate] : dates;
    let reprocessed = 0;

    for (const dateStr of targetDates) {
      const date = new Date(dateStr + 'T00:00:00');

      // Get all attendance records with check-in on this date
      const [records]: any = await pool.execute(
        `SELECT a.id, a.user_id, a.check_in_time, a.check_out_time
         FROM attendance a
         WHERE a.date = ? AND a.check_in_time IS NOT NULL`,
        [dateStr]
      );

      for (const record of records) {
        await this.updateAttendanceWithScheduleInfo(
          record.id,
          record.user_id,
          date,
          0
        );
        reprocessed++;
      }
    }

    return { reprocessed, dates: targetDates };
  }
}
