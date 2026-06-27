-- Migration: Create floating_day_requests table
-- Description: Enables staff to request compensatory/floating days off.
-- Balance is tracked via the existing time_off_banks table.
-- Two-level approval: manager clears, HR approves.
-- On HR approval: creates day_off shift_exception, deducts from time_off_banks,
-- and re-processes attendance for the scheduled date.

CREATE TABLE IF NOT EXISTS floating_day_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  time_off_bank_id INT NOT NULL COMMENT 'Which day-off program this request uses',
  date DATE NOT NULL COMMENT 'The day the employee wants off',
  reason TEXT,
  status ENUM('pending', 'cleared', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  cleared_by INT NULL COMMENT 'Manager who cleared (first approval)',
  cleared_at TIMESTAMP NULL,
  approved_by INT NULL COMMENT 'HR who gave final approval',
  approved_at TIMESTAMP NULL,
  rejected_by INT NULL,
  rejected_at TIMESTAMP NULL,
  rejection_reason TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (time_off_bank_id) REFERENCES time_off_banks(id),
  FOREIGN KEY (cleared_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (rejected_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_date (date)
);
