-- Migration: Add recurrence fields to shift_timings table
-- Description: Enables day-of-week constraints on shift_timings records
--              Required for multi-shift assignments (e.g. Saturday-only shift)

-- Step 1: Add recurrence_pattern column
ALTER TABLE shift_timings
ADD COLUMN recurrence_pattern ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'weekly'
AFTER effective_to;

-- Step 2: Add recurrence_days column (JSON array of day names)
ALTER TABLE shift_timings
ADD COLUMN recurrence_days JSON
AFTER recurrence_pattern;

-- Step 3: Add index for efficient recurring shift queries
ALTER TABLE shift_timings
ADD INDEX idx_recurrence (user_id, recurrence_pattern, effective_from, effective_to);

-- Step 4: Update existing shift timings to have recurrence_pattern = 'daily'
-- (existing records without recurrence should apply to all days to maintain behavior)
UPDATE shift_timings
SET recurrence_pattern = 'daily'
WHERE recurrence_pattern IS NULL OR recurrence_pattern = 'weekly';

-- Verification: Check shift timings with recurrence
SELECT
  id,
  user_id,
  shift_name,
  recurrence_pattern,
  recurrence_days,
  effective_from,
  effective_to
FROM shift_timings
ORDER BY id DESC
LIMIT 10;
