-- Migration: Create attendance table
-- Description: Creates the attendance table for tracking staff attendance with location verification

CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'half_day', 'leave', 'holiday') DEFAULT 'absent',
  check_in_time TIME NULL,
  check_out_time TIME NULL,
  location_coordinates POINT NULL, -- Stores GPS coordinates (lat, lng)
  location_verified BOOLEAN DEFAULT FALSE, -- Whether location was verified against geofence
  location_address TEXT, -- Human-readable address for verification
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_date (user_id, date),
  INDEX idx_date (date),
  INDEX idx_status (status)
);