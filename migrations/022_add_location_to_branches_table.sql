-- Migration: Add location coordinates to branches table
-- Description: Adds GPS coordinates to branches for attendance location verification

ALTER TABLE branches
ADD COLUMN location_coordinates VARCHAR(255) COMMENT 'GPS coordinates (latitude, longitude) for geofencing',
ADD COLUMN location_radius_meters INT DEFAULT 100 COMMENT 'Radius in meters for geofencing around branch location',
ADD COLUMN attendance_mode ENUM('branch_based', 'multiple_locations') DEFAULT 'branch_based' COMMENT 'Attendance verification mode for this branch';