-- Migration: Add last_saturday_resumption_time to global_attendance_settings
-- Description: Allows configuring the resumption/start time for last Saturdays of the month.
-- Default is 10:30 (10:30 AM). When changed mid-day, attendance records for the
-- current last Saturday are retroactively recalculated.

ALTER TABLE global_attendance_settings
  ADD COLUMN last_saturday_resumption_time VARCHAR(5) DEFAULT '10:30' AFTER exclude_sundays_from_leave;

UPDATE global_attendance_settings
SET last_saturday_resumption_time = '10:30'
WHERE last_saturday_resumption_time IS NULL;
