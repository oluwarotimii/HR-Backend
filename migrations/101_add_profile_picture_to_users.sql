-- Migration: Add profile_picture column to users table
-- Description: Support for staff profile photo uploads
-- Date: March 25, 2026

-- Add profile_picture column
ALTER TABLE users
ADD COLUMN profile_picture VARCHAR(255) NULL AFTER must_change_password;

-- Verify the column was added
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'profile_picture';
