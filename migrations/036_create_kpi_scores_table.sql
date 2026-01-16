CREATE TABLE IF NOT EXISTS kpi_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kpi_assignment_id INT NOT NULL,
  calculated_value DECIMAL(10,2) NOT NULL,
  achievement_percentage DECIMAL(5,2) NOT NULL,
  weighted_score DECIMAL(5,2) NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  manually_overridden BOOLEAN DEFAULT FALSE,
  override_value DECIMAL(10,2) NULL,
  override_reason TEXT NULL,
  override_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kpi_assignment_id) REFERENCES kpi_assignments(id),
  FOREIGN KEY (override_by) REFERENCES users(id),
  INDEX idx_kpi_assignment_id (kpi_assignment_id),
  INDEX idx_calculated_at (calculated_at)
);