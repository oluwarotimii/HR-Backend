-- Migration: Create leave_requests table
-- Description: Dedicated table for leave requests (replaces form_submissions approach)

CREATE TABLE IF NOT EXISTS leave_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INT NOT NULL,
  reason TEXT NOT NULL,
  attachments JSON COMMENT 'Array of attachment objects {name, url, size}',
  status ENUM('submitted', 'approved', 'rejected', 'cancelled') DEFAULT 'submitted',
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_leave_type_id (leave_type_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);
