-- Migration: Create staff table
-- Description: Creates the staff table for storing employee records linked to users

CREATE TABLE IF NOT EXISTS staff (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  employee_id VARCHAR(50) UNIQUE,
  designation VARCHAR(255),
  department VARCHAR(255),
  branch_id INT,
  joining_date DATE,
  employment_type ENUM('full_time', 'part_time', 'contract', 'temporary') DEFAULT 'full_time',
  status ENUM('active', 'inactive', 'terminated', 'on_leave') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_department (department),
  INDEX idx_branch_id (branch_id),
  INDEX idx_status (status)
);