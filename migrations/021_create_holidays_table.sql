-- Migration: Create holidays table
-- Description: Creates the holidays table for managing company and branch-specific holidays

CREATE TABLE IF NOT EXISTS holidays (
  id INT PRIMARY KEY AUTO_INCREMENT,
  holiday_name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  branch_id INT NULL, -- NULL means company-wide holiday, specific ID means branch-specific
  is_mandatory BOOLEAN DEFAULT TRUE, -- Whether this is a mandatory day off
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_date (date),
  INDEX idx_branch (branch_id),
  INDEX idx_holiday_name (holiday_name)
);