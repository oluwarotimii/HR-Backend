-- Migration: Add constraints to leave_allocations table
-- Description: Prevents invalid data and duplicate allocations

-- Add check constraint to prevent used_days exceeding allocated + carried_over
ALTER TABLE leave_allocations
ADD CONSTRAINT chk_used_days CHECK (used_days <= allocated_days + carried_over_days);

-- Add unique constraint to prevent duplicate allocations for same user/leave_type/cycle
ALTER TABLE leave_allocations
ADD CONSTRAINT uniq_user_leave_cycle UNIQUE (user_id, leave_type_id, cycle_start_date, cycle_end_date);
