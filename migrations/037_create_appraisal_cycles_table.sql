CREATE TABLE IF NOT EXISTS appraisal_cycles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES appraisal_templates(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_template_id (template_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);