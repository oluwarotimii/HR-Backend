-- Migration: Add auto_checkout columns to branches table
-- Date: March 24, 2026
-- Purpose: Enable auto-checkout functionality for branches
-- Migration Number: 099

-- Add auto_checkout_enabled column (default: FALSE for safety)
ALTER TABLE branches 
ADD COLUMN auto_checkout_enabled BOOLEAN DEFAULT FALSE COMMENT 'Enable automatic checkout for this branch';

-- Add auto_checkout_minutes_after_close column (default: 30 minutes)
ALTER TABLE branches 
ADD COLUMN auto_checkout_minutes_after_close INT DEFAULT 30 COMMENT 'Minutes after closing time to auto-checkout';

-- Add closing_time column if it doesn't exist (default: 17:00)
ALTER TABLE branches 
ADD COLUMN closing_time TIME DEFAULT '17:00:00' COMMENT 'Branch closing time for auto-checkout calculation';

-- Update existing branches to have sensible defaults
-- Enable auto-checkout with 30 minutes after 5 PM closing
UPDATE branches 
SET 
  auto_checkout_enabled = TRUE,
  auto_checkout_minutes_after_close = 30,
  closing_time = '17:00:00'
WHERE id > 0;

-- Add index for faster queries
CREATE INDEX idx_branches_auto_checkout ON branches(auto_checkout_enabled, closing_time);

-- Add comment to table
ALTER TABLE branches 
COMMENT = 'Branches with auto-checkout configuration for attendance management';
