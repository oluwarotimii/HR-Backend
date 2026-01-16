-- Migration: Create attendance_locations table
-- Description: Creates the attendance_locations table for managing multiple approved attendance locations

CREATE TABLE IF NOT EXISTS attendance_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  location_coordinates POINT NOT NULL, -- GPS coordinates (lat, lng)
  location_radius_meters INT DEFAULT 100, -- Radius in meters for geofencing
  branch_id INT NULL, -- Associated branch (optional)
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  SPATIAL INDEX(location_coordinates), -- Spatial index for geographic queries
  INDEX idx_active (is_active)
);