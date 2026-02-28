-- Migration: Add recurring shift fields to employee_shift_assignments
-- Description: Enhances employee_shift_assignments table to support recurring weekly shift patterns
--              This enables use cases like "Resume Late every Monday" or "Close Early every Wednesday"
--              on a per-staff basis

-- Add recurrence_pattern column
ALTER TABLE employee_shift_assignments
ADD COLUMN recurrence_pattern ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none'
AFTER assignment_type;

-- Add recurrence_day_of_week column
ALTER TABLE employee_shift_assignments
ADD COLUMN recurrence_day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
AFTER recurrence_pattern;

-- Add recurrence_day_of_month column (for monthly patterns like "first Monday of every month")
ALTER TABLE employee_shift_assignments
ADD COLUMN recurrence_day_of_month INT
AFTER recurrence_day_of_week;

-- Add recurrence_end_date column
ALTER TABLE employee_shift_assignments
ADD COLUMN recurrence_end_date DATE
AFTER recurrence_day_of_month;

-- Add index for efficient recurring shift queries
ALTER TABLE employee_shift_assignments
ADD INDEX idx_recurrence_pattern (recurrence_pattern, recurrence_day_of_week, recurrence_end_date);

-- Add index for user-specific recurring shifts
ALTER TABLE employee_shift_assignments
ADD INDEX idx_user_recurrence (user_id, recurrence_pattern, recurrence_day_of_week);

-- Update existing permanent assignments to have recurrence_pattern = 'none'
UPDATE employee_shift_assignments 
SET recurrence_pattern = 'none' 
WHERE assignment_type = 'permanent' AND recurrence_pattern IS NULL;

-- Update existing temporary assignments to have recurrence_pattern = 'none'
UPDATE employee_shift_assignments 
SET recurrence_pattern = 'none' 
WHERE assignment_type = 'temporary' AND recurrence_pattern IS NULL;

-- Update existing rotating assignments to have recurrence_pattern = 'weekly'
UPDATE employee_shift_assignments 
SET recurrence_pattern = 'weekly' 
WHERE assignment_type = 'rotating' AND recurrence_pattern IS NULL;
