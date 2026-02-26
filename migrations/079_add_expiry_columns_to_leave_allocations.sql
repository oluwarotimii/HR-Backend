-- Migration: Add expiry tracking columns to leave_allocations
-- Description: Adds columns needed for leave expiry processing

ALTER TABLE leave_allocations
ADD COLUMN expiry_rule_id INT,
ADD COLUMN processed_for_expiry TIMESTAMP NULL;

ALTER TABLE leave_allocations
ADD FOREIGN KEY (expiry_rule_id) REFERENCES leave_expiry_rules(id);

CREATE INDEX idx_leave_allocations_expiry ON leave_allocations(expiry_rule_id, processed_for_expiry);
