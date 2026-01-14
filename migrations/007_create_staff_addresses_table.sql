-- Migration: Create staff_addresses table
-- Description: Creates the staff_addresses table for storing employee addresses

CREATE TABLE IF NOT EXISTS staff_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  address_type ENUM('permanent', 'current', 'emergency_contact') NOT NULL,
  street_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Nigeria',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  INDEX idx_staff_id (staff_id),
  INDEX idx_address_type (address_type),
  INDEX idx_city (city),
  INDEX idx_state (state)
);