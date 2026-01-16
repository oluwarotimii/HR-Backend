CREATE TABLE IF NOT EXISTS kpi_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  kpi_definition_id INT NOT NULL,
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  assigned_by INT NOT NULL,
  custom_target_value DECIMAL(10,2) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (kpi_definition_id) REFERENCES kpi_definitions(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_kpi_definition_id (kpi_definition_id)
);