-- Migration: Create branch_working_days table
-- Description: Configure working days and hours per branch

CREATE TABLE IF NOT EXISTS branch_working_days (
  id INT PRIMARY KEY AUTO_INCREMENT,
  branch_id INT NOT NULL,
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  is_working_day BOOLEAN DEFAULT TRUE,
  start_time TIME,
  end_time TIME,
  break_duration_minutes INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_branch_day (branch_id, day_of_week),
  INDEX idx_branch (branch_id),
  INDEX idx_day_of_week (day_of_week)
);

-- Insert default working days (Mon-Fri 9am-5pm) for all existing branches
INSERT IGNORE INTO branch_working_days (branch_id, day_of_week, is_working_day, start_time, end_time, break_duration_minutes)
SELECT
  b.id,
  day.day_of_week,
  CASE
    WHEN day.day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday') THEN TRUE
    ELSE FALSE
  END as is_working_day,
  CASE
    WHEN day.day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday') THEN '09:00:00'
    ELSE NULL
  END as start_time,
  CASE
    WHEN day.day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday') THEN '17:00:00'
    ELSE NULL
  END as end_time,
  30 as break_duration_minutes
FROM branches b
CROSS JOIN (
  SELECT 'monday' as day_of_week UNION ALL
  SELECT 'tuesday' UNION ALL
  SELECT 'wednesday' UNION ALL
  SELECT 'thursday' UNION ALL
  SELECT 'friday' UNION ALL
  SELECT 'saturday' UNION ALL
  SELECT 'sunday'
) day;
