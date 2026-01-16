-- Migration: Create leave_types table
-- Description: Creates the leave_types table for defining different types of leave

CREATE TABLE IF NOT EXISTS leave_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  days_per_year INT DEFAULT 0,
  is_paid BOOLEAN DEFAULT TRUE,
  allow_carryover BOOLEAN DEFAULT FALSE,
  carryover_limit INT DEFAULT 0,
  expiry_rule_id INT, -- Will reference leave_expiry_rules once that table is created
  created_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
);