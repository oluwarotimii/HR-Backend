-- Migration: Create attendance_auto_checkout_log table
-- Purpose: Log all automatic checkouts for audit trail
-- Date: March 24, 2026

CREATE TABLE IF NOT EXISTS attendance_auto_checkout_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  checkout_date DATE NOT NULL,
  checkout_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_checkout_date (checkout_date),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment
ALTER TABLE attendance_auto_checkout_log 
COMMENT = 'Logs all automatic attendance checkouts for audit and compliance';
