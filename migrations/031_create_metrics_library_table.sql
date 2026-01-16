CREATE TABLE IF NOT EXISTS metrics_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data_type ENUM('numeric', 'percentage', 'boolean', 'rating') NOT NULL,
  formula TEXT,
  data_source VARCHAR(255),
  categories JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_by (created_by),
  INDEX idx_is_active (is_active)
);