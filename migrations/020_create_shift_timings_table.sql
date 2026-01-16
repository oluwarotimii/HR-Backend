-- Migration: Create shift_timings table
-- Description: Creates the shift_timings table for managing staff work schedules

CREATE TABLE IF NOT EXISTS shift_timings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL, -- NULL means applies to all staff, specific ID means individual override
  shift_name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL, -- Standard start time (e.g., '09:00:00')
  end_time TIME NOT NULL, -- Standard end time (e.g., '17:00:00')
  effective_from DATE NOT NULL,
  effective_to DATE NULL, -- NULL means indefinite
  override_branch_id INT NULL, -- Specific branch override
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (override_branch_id) REFERENCES branches(id),
  INDEX idx_user_effective (user_id, effective_from, effective_to),
  INDEX idx_branch (override_branch_id)
);