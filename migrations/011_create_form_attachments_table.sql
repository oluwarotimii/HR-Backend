-- Migration: Create form_attachments table
-- Description: Creates the form_attachments table for storing uploaded files tied to form submissions

CREATE TABLE IF NOT EXISTS form_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_submission_id INT NOT NULL,
  field_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (form_submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES form_fields(id),
  INDEX idx_form_submission_field (form_submission_id, field_id)
);