-- Migration: Create leave_expiry_rules table
-- Description: Creates the leave_expiry_rules table for defining expiry rules for leave types

CREATE TABLE IF NOT EXISTS leave_expiry_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  expire_after_days INT DEFAULT 365,
  trigger_notification_days JSON, -- Array of days before expiry to notify (e.g., [30, 14, 7, 1])
  auto_expire_action ENUM('forfeit', 'carryover', 'extend') DEFAULT 'forfeit',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_name (name)
);