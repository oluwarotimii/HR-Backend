-- Migration: Create form_fields table
-- Description: Creates the form_fields table for storing individual fields within forms

CREATE TABLE IF NOT EXISTS form_fields (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_id INT NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type ENUM('text', 'email', 'number', 'date', 'textarea', 'dropdown', 'checkbox', 'file', 'phone', 'address') NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  placeholder VARCHAR(255),
  help_text TEXT,
  validation_rule VARCHAR(500),
  options JSON,
  field_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  UNIQUE KEY uk_form_field_name (form_id, field_name),
  INDEX idx_field_order (field_order)
);