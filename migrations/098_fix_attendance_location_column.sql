-- Migration: Fix attendance location_coordinates column to accept NULL
-- Date: March 24, 2026
-- Issue: GEOMETRY field doesn't accept NULL properly

-- First, drop the existing column
ALTER TABLE attendance DROP COLUMN IF EXISTS location_coordinates;

-- Add it back with proper NULL handling
ALTER TABLE attendance 
ADD COLUMN location_coordinates GEOMETRY NULL DEFAULT NULL AFTER check_out_time;

-- Add comment
ALTER TABLE attendance 
COMMENT = 'Attendance records with proper NULL handling for optional location data';
