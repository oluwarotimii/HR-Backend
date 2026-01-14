-- Migration: Create staff_documents table
-- Description: Creates the staff_documents table for storing employee document records

CREATE TABLE IF NOT EXISTS staff_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by INT,
  verified_at TIMESTAMP NULL,
  
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_staff_id (staff_id),
  INDEX idx_document_type (document_type),
  INDEX idx_expiry_date (expiry_date)
);