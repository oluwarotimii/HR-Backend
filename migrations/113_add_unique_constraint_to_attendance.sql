-- Migration: Add unique constraint to attendance
-- Description: Prevents multiple attendance records for the same user on the same date

-- Before applying the unique constraint, we must ensure there are no existing duplicates.
-- (The repair script handles this, but this migration will fail if duplicates still exist)

ALTER TABLE attendance ADD CONSTRAINT UNIQUE_USER_DATE UNIQUE (user_id, date);
