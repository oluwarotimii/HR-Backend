-- Migration: Create daily shift assignments table
-- Description: Enables creating one-off shifts for specific dates
--              Useful for daily monitoring, adjustments, and exceptions
--              This is OPTIONAL - only run if you need daily shift management
-- Author: HR System
-- Date: 2026-03-29

-- Step 1: Create daily_shift_assignments table
CREATE TABLE IF NOT EXISTS daily_shift_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INT DEFAULT 30,
  shift_type ENUM('scheduled', 'exception', 'overtime', 'on_call') DEFAULT 'scheduled',
  notes TEXT,
  override_shift_template_id INT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (override_shift_template_id) REFERENCES shift_templates(id) ON DELETE SET NULL,

  -- Constraints
  UNIQUE KEY unique_user_date (user_id, shift_date),
  
  -- Indexes for efficient queries
  INDEX idx_user_date (user_id, shift_date),
  INDEX idx_branch_date (branch_id, shift_date),
  INDEX idx_date (shift_date),
  INDEX idx_user_branch (user_id, branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Add documentation comments
ALTER TABLE daily_shift_assignments
MODIFY COLUMN shift_type ENUM('scheduled', 'exception', 'overtime', 'on_call') 
COMMENT 'scheduled=regular shift, exception=override to recurring, overtime=extra hours, on_call=standby';

ALTER TABLE daily_shift_assignments
MODIFY COLUMN override_shift_template_id INT NULL
COMMENT 'If set, this daily shift overrides the recurring shift template for this date';

-- Step 3: Create view for easy daily shift monitoring (optional)
CREATE OR REPLACE VIEW v_daily_shifts_summary AS
SELECT 
  dsa.id,
  dsa.user_id,
  u.full_name as employee_name,
  u.email as employee_email,
  dsa.branch_id,
  b.name as branch_name,
  dsa.shift_date,
  DAYNAME(dsa.shift_date) as day_of_week,
  dsa.start_time,
  dsa.end_time,
  dsa.break_duration_minutes,
  TIMESTAMPDIFF(MINUTE, dsa.start_time, dsa.end_time) - dsa.break_duration_minutes as net_working_minutes,
  ROUND((TIMESTAMPDIFF(MINUTE, dsa.start_time, dsa.end_time) - dsa.break_duration_minutes) / 60, 2) as net_working_hours,
  dsa.shift_type,
  dsa.notes,
  dsa.created_by,
  creator.full_name as created_by_name,
  dsa.created_at,
  dsa.updated_at
FROM daily_shift_assignments dsa
LEFT JOIN users u ON dsa.user_id = u.id
LEFT JOIN branches b ON dsa.branch_id = b.id
LEFT JOIN users creator ON dsa.created_by = creator.id
ORDER BY dsa.shift_date DESC, dsa.branch_id, u.full_name;

-- Verification: Show table structure
DESCRIBE daily_shift_assignments;

-- Show indexes
SHOW INDEX FROM daily_shift_assignments;

-- Sample query: Get daily shifts for today
SELECT * FROM v_daily_shifts_summary
WHERE shift_date = CURDATE();

-- Sample query: Get daily shifts for a specific branch this week
SELECT * FROM v_daily_shifts_summary
WHERE branch_id = 1
  AND shift_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);

-- Sample query: Count shifts by type
SELECT 
  shift_type,
  COUNT(*) as count,
  SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time) - break_duration_minutes) / 60 as total_hours
FROM daily_shift_assignments
GROUP BY shift_type;

-- Rollback (if needed):
-- DROP VIEW IF EXISTS v_daily_shifts_summary;
-- DROP TABLE IF EXISTS daily_shift_assignments;
