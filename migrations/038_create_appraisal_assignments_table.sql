CREATE TABLE IF NOT EXISTS appraisal_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  appraisal_cycle_id INT NOT NULL,
  status ENUM('pending', 'in_progress', 'submitted', 'reviewed', 'completed') DEFAULT 'pending',
  assigned_by INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES staff(id),
  FOREIGN KEY (appraisal_cycle_id) REFERENCES appraisal_cycles(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_appraisal_cycle_id (appraisal_cycle_id),
  INDEX idx_status (status)
);