-- Migration: Update staff_invitations table for new invitation flow
-- Description: Add 'cancelled' to status ENUM, add user_id foreign key
-- Date: March 25, 2026

-- Step 1: Modify status ENUM to include 'cancelled'
ALTER TABLE staff_invitations
MODIFY COLUMN status ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled') DEFAULT 'pending';

-- Step 2: Add user_id column to link to pre-created user account
ALTER TABLE staff_invitations
ADD COLUMN user_id INT NULL AFTER department_id,
ADD CONSTRAINT fk_invitation_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 3: Add index for better query performance
CREATE INDEX idx_user_id ON staff_invitations(user_id);

-- Step 4: Update existing invitations to have NULL user_id (no pre-created accounts)
UPDATE staff_invitations SET user_id = NULL WHERE user_id IS NULL;

-- Verification: Check column changes
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'staff_invitations'
  AND COLUMN_NAME IN ('status', 'user_id');

-- Verification: Check foreign key constraint
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'staff_invitations'
  AND CONSTRAINT_NAME = 'fk_invitation_user';
