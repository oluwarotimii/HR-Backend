-- Attendance Auto-Mark Settings Migration
-- Date: March 21, 2026
-- Purpose: Add configurable auto-mark absent time and locking mechanism

-- STEP 1: Add columns to branches table

ALTER TABLE branches
  ADD COLUMN auto_mark_absent_enabled BOOLEAN DEFAULT TRUE AFTER attendance_mode,
  ADD COLUMN auto_mark_absent_time VARCHAR(5) DEFAULT '12:00' AFTER auto_mark_absent_enabled,
  ADD COLUMN auto_mark_absent_timezone VARCHAR(50) DEFAULT 'Africa/Nairobi' AFTER auto_mark_absent_time,
  ADD COLUMN attendance_lock_date DATE NULL AFTER auto_mark_absent_timezone;

-- Set existing branches to default (12:00 PM auto-mark)
UPDATE branches
SET
  auto_mark_absent_enabled = TRUE,
  auto_mark_absent_time = '12:00',
  auto_mark_absent_timezone = 'Africa/Nairobi'
WHERE auto_mark_absent_enabled IS NULL;

-- STEP 2: Add locking columns to attendance table

ALTER TABLE attendance
  ADD COLUMN is_locked BOOLEAN DEFAULT FALSE AFTER notes,
  ADD COLUMN locked_at TIMESTAMP NULL AFTER is_locked,
  ADD COLUMN locked_by INT NULL AFTER locked_at,
  ADD COLUMN lock_reason VARCHAR(255) NULL AFTER locked_by,
  ADD CONSTRAINT fk_attendance_locked_by
    FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE SET NULL;

-- STEP 3: Create attendance_lock_log table

CREATE TABLE IF NOT EXISTS attendance_lock_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  branch_id INT NOT NULL,
  lock_date DATE NOT NULL,
  locked_by INT NOT NULL,
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attendance_count INT DEFAULT 0,
  absent_count INT DEFAULT 0,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_lock_date (lock_date),
  INDEX idx_branch_date (branch_id, lock_date),
  INDEX idx_locked_at (locked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 4: Verify changes

-- Check branches table
SELECT
  COLUMN_NAME,
  DATA_TYPE,
  COLUMN_DEFAULT,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'branches'
  AND COLUMN_NAME IN (
    'auto_mark_absent_enabled',
    'auto_mark_absent_time',
    'auto_mark_absent_timezone',
    'attendance_lock_date'
  );

-- Check attendance table
SELECT
  COLUMN_NAME,
  DATA_TYPE,
  COLUMN_DEFAULT,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'attendance'
  AND COLUMN_NAME IN (
    'is_locked',
    'locked_at',
    'locked_by',
    'lock_reason'
  );

-- Check attendance_lock_log table exists
SHOW TABLES LIKE 'attendance_lock_log';
