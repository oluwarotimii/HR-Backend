-- Migration: Ensure leave_requests has cancellation tracking fields
-- Description: Adds cancelled_by, cancelled_at, cancellation_reason if they don't exist
-- Date: March 27, 2026
-- Issue: Migration 089 dropped and recreated leave_requests table without cancellation fields

-- Check and add cancelled_by column
SET @dbname = DATABASE();
SET @tablename = 'leave_requests';
SET @columnname = 'cancelled_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE leave_requests ADD COLUMN cancelled_by INT NULL AFTER reviewed_by, ADD CONSTRAINT fk_leave_requests_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add cancelled_at column
SET @columnname = 'cancelled_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE leave_requests ADD COLUMN cancelled_at DATETIME NULL AFTER cancelled_by'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add cancellation_reason column
SET @columnname = 'cancellation_reason';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE leave_requests ADD COLUMN cancellation_reason TEXT NULL AFTER cancelled_at'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify the columns exist
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'leave_requests'
  AND COLUMN_NAME IN ('cancelled_by', 'cancelled_at', 'cancellation_reason')
ORDER BY ORDINAL_POSITION;
