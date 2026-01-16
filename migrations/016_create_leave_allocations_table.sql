-- Migration: Create leave_allocations table
-- Description: Creates the leave_allocations table for tracking leave allocations to staff

CREATE TABLE IF NOT EXISTS leave_allocations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  leave_type_id INT NOT NULL, -- Will reference leave_types once that table is created
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  allocated_days DECIMAL(5,2) NOT NULL,
  used_days DECIMAL(5,2) DEFAULT 0.00,
  carried_over_days DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_leave_type (user_id, leave_type_id),
  INDEX idx_cycle_dates (cycle_start_date, cycle_end_date)
);