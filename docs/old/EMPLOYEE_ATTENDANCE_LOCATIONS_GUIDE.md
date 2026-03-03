# Managing Employee Attendance Locations

**Last Updated:** March 1, 2026

---

## Overview

Your HR system supports **flexible attendance location management** where you can:
1. Assign different employees to check in at different locations
2. Create multiple approved locations per branch
3. Control which employees can check in at which locations
4. Support remote workers, field staff, and multi-site employees

---

## Table of Contents

1. [Location Management Strategies](#location-management-strategies)
2. [Database Structure](#database-structure)
3. [Setup Guide](#setup-guide)
4. [API Examples](#api-examples)
5. [Frontend Implementation](#frontend-implementation)
6. [Common Use Cases](#common-use-cases)

---

## Location Management Strategies

### Strategy 1: Branch-Based Attendance (Default)

**How it works:**
- Each employee belongs to a branch
- Employee checks in at branch location only
- Geofence radius determines valid check-in area

**Best for:**
- Office-based employees
- Single location workers
- Retail staff

**Setup:**
```json
{
  "branch": {
    "name": "Nairobi HQ",
    "location_coordinates": "POINT(36.817223 -1.286389)",
    "location_radius_meters": 100,
    "attendance_mode": "branch_based"
  }
}
```

**Employee Assignment:**
- Automatically assigned via `staff.branch_id`
- No additional configuration needed

---

### Strategy 2: Multiple Locations Per Branch

**How it works:**
- Branch has multiple approved attendance locations
- Employees can check in at ANY of the approved locations
- Example: Head office + satellite offices + client sites

**Best for:**
- Sales teams visiting multiple sites
- Field service technicians
- Consultants

**Setup:**
```json
{
  "branch": {
    "name": "Nairobi Sales Office",
    "attendance_mode": "multiple_locations"
  },
  "attendance_locations": [
    {
      "name": "Head Office - Westlands",
      "location_coordinates": "POINT(36.817223 -1.286389)",
      "location_radius_meters": 100
    },
    {
      "name": "Satellite Office - Karen",
      "location_coordinates": "POINT(36.707200 -1.318900)",
      "location_radius_meters": 100
    },
    {
      "name": "Client Site - Gigiri",
      "location_coordinates": "POINT(36.812300 -1.264500)",
      "location_radius_meters": 150
    }
  ]
}
```

**Employee Assignment:**
- All employees in branch can check in at ANY location
- No per-employee configuration

---

### Strategy 3: Employee-Specific Locations (Recommended for Your Use Case)

**How it works:**
- Create attendance locations with specific assignments
- Assign employees to specific locations
- Each employee has their own approved check-in location(s)

**Best for:**
- Remote workers at different home locations
- Field staff assigned to different territories
- Multi-branch employees with specific duty stations

**Setup:**

#### Step 1: Create Attendance Locations

```bash
POST /api/attendance-locations
```

```json
{
  "name": "Remote Worker - Nairobi Zone A",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_radius_meters": 200,
  "branch_id": 1,
  "is_active": true
}
```

#### Step 2: Assign Employees to Locations

**Option A: Via Branch Assignment**
- Assign employee to branch with specific location
- Employee can check in at that branch's locations

**Option B: Via Custom Field (Recommended)**
Add a custom field to track assigned location:

```sql
-- Add custom field to staff table
ALTER TABLE staff ADD COLUMN assigned_location_id INT;
ALTER TABLE staff ADD FOREIGN KEY (assigned_location_id) REFERENCES attendance_locations(id);
```

Then assign:
```sql
UPDATE staff 
SET assigned_location_id = 5 
WHERE user_id = 123;
```

**Option C: Via Tags/Metadata**
Store location assignment in staff notes or metadata:
```json
{
  "staff": {
    "user_id": 123,
    "notes": "Assigned Location ID: 5 (Remote - Mombasa)"
  }
}
```

---

### Strategy 4: Flexible/Remote Attendance

**How it works:**
- No location verification required
- Employees can check in from anywhere
- Optional: IP-based verification or WiFi SSID

**Best for:**
- Fully remote teams
- Traveling sales staff
- Executive leadership

**Setup:**
```json
{
  "branch": {
    "attendance_mode": "flexible"
  }
}
```

---

## Database Structure

### Attendance Locations Table

```sql
CREATE TABLE attendance_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,              -- e.g., "Remote Worker - Zone A"
  location_coordinates POINT NOT NULL,      -- GPS coordinates
  location_radius_meters INT DEFAULT 100,   -- Geofence size
  branch_id INT NULL,                       -- Associated branch
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  SPATIAL INDEX(location_coordinates)
);
```

### Staff Table (Enhanced)

```sql
-- Add these fields for location assignment
ALTER TABLE staff ADD COLUMN assigned_location_id INT;
ALTER TABLE staff ADD FOREIGN KEY (assigned_location_id) REFERENCES attendance_locations(id);

-- Or use JSON metadata for flexibility
ALTER TABLE staff ADD COLUMN location_assignments JSON;
-- Example: {"primary_location": 5, "secondary_locations": [6, 7]}
```

### Attendance Table

```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'half_day', 'leave', 'holiday'),
  
  -- Location tracking
  location_coordinates POINT,               -- Where employee checked in
  location_verified BOOLEAN DEFAULT FALSE,  -- Was location validated?
  location_address TEXT,                    -- Human-readable address
  
  -- Times
  check_in_time TIME,
  check_out_time TIME,
  
  -- Shift schedule
  scheduled_start_time TIME,
  scheduled_end_time TIME,
  is_late BOOLEAN,
  actual_working_hours DECIMAL(4,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  SPATIAL INDEX(location_coordinates)
);
```

---

## Setup Guide

### Scenario: 100 Employees, Different Check-in Locations

**Requirements:**
- 70 employees at main office (Nairobi HQ)
- 30 employees at various remote locations
- Each remote employee has different approved location

### Step 1: Create Branch

```bash
POST /api/branches
```

```json
{
  "name": "Nairobi Headquarters",
  "code": "NBO-HQ",
  "address": "Westlands, Nairobi",
  "city": "Nairobi",
  "country": "Kenya",
  "location_coordinates": "POINT(36.817223 -1.286389)",
  "location_radius_meters": 100,
  "attendance_mode": "multiple_locations"
}
```

### Step 2: Create Attendance Locations

#### Main Office Location (for 70 employees)

```bash
POST /api/attendance-locations
```

```json
{
  "name": "Nairobi HQ - Main Building",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_radius_meters": 150,
  "branch_id": 1,
  "is_active": true
}
```

#### Remote Locations (for 30 remote employees)

Create 30 different locations:

```json
// Location 1: Remote Worker - Karen
{
  "name": "Remote - Karen (Employee: John Doe)",
  "location_coordinates": {
    "latitude": -1.318900,
    "longitude": 36.707200
  },
  "location_radius_meters": 200,
  "branch_id": 1,
  "is_active": true
}

// Location 2: Remote Worker - Gigiri
{
  "name": "Remote - Gigiri (Employee: Jane Smith)",
  "location_coordinates": {
    "latitude": -1.264500,
    "longitude": 36.812300
  },
  "location_radius_meters": 200,
  "branch_id": 1,
  "is_active": true
}

// ... repeat for all 30 remote employees
```

### Step 3: Assign Employees to Locations

#### Method A: Update Staff Record

```sql
-- Assign employee to specific location
UPDATE staff 
SET assigned_location_id = 1  -- Main office
WHERE user_id IN (1, 2, 3, ..., 70);  -- First 70 employees

UPDATE staff 
SET assigned_location_id = 2  -- Karen location
WHERE user_id = 71;

UPDATE staff 
SET assigned_location_id = 3  -- Gigiri location
WHERE user_id = 72;

-- ... repeat for all remote employees
```

#### Method B: Via API

```bash
PUT /api/staff/:id
```

```json
{
  "assigned_location_id": 5
}
```

### Step 4: Configure Attendance Settings

```bash
PATCH /api/attendance/settings
```

```json
{
  "branchId": 1,
  "settings": {
    "attendance_mode": "multiple_locations",
    "require_check_in": true,
    "require_check_out": true,
    "enable_location_verification": true,
    "grace_period_minutes": 15
  }
}
```

---

## API Examples

### Get All Attendance Locations

```bash
GET /api/attendance-locations?branchId=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attendanceLocations": [
      {
        "id": 1,
        "name": "Nairobi HQ - Main Building",
        "location_coordinates": "POINT(36.817223 -1.286389)",
        "location_radius_meters": 150,
        "branch_id": 1,
        "is_active": true
      },
      {
        "id": 2,
        "name": "Remote - Karen (John Doe)",
        "location_coordinates": "POINT(36.707200 -1.318900)",
        "location_radius_meters": 200,
        "branch_id": 1,
        "is_active": true
      }
    ]
  }
}
```

### Create Attendance Location

```bash
POST /api/attendance-locations
Authorization: Bearer <token>
```

```json
{
  "name": "Remote Worker - Mombasa",
  "location_coordinates": {
    "latitude": -4.043477,
    "longitude": 39.668206
  },
  "location_radius_meters": 200,
  "branch_id": 1,
  "is_active": true
}
```

### Assign Employee to Location

```bash
PUT /api/staff/:employeeId
Authorization: Bearer <token>
```

```json
{
  "assigned_location_id": 5,
  "notes": "Assigned to remote location - Mombasa"
}
```

### Check-in with Location Verification

```bash
POST /api/attendance/check-in
Authorization: Bearer <token>
```

```json
{
  "date": "2026-03-01",
  "check_in_time": "08:55:00",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_address": "Nairobi HQ, Westlands"
}
```

**Backend Logic:**
```typescript
// 1. Get employee's assigned location
const staff = await StaffModel.findByUserId(userId);
const assignedLocationId = staff.assigned_location_id;

// 2. Get assigned location details
const assignedLocation = await AttendanceLocationModel.findById(assignedLocationId);

// 3. Verify employee is at correct location
const distance = calculateDistance(
  assignedLocation.location_coordinates,
  checkInCoordinates
);

const isVerified = distance <= assignedLocation.location_radius_meters;

// 4. Create attendance record
await AttendanceModel.create({
  user_id: userId,
  location_verified: isVerified,
  // ... other fields
});
```

---

## Frontend Implementation

### React Component: Assign Locations

```typescript
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-service';

interface Location {
  id: number;
  name: string;
  location_coordinates: string;
  location_radius_meters: number;
  branch_id: number;
}

interface Employee {
  user_id: number;
  full_name: string;
  employee_id: string;
  assigned_location_id?: number;
}

const AssignLocations: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchLocations();
  }, []);

  const fetchEmployees = async () => {
    const response = await apiService.request('/staff');
    setEmployees(response.data.staff);
  };

  const fetchLocations = async () => {
    const response = await apiService.request('/attendance-locations');
    setLocations(response.data.attendanceLocations);
  };

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedLocation) return;

    setLoading(true);
    try {
      await apiService.request(`/staff/${selectedEmployee}`, {
        method: 'PUT',
        body: JSON.stringify({
          assigned_location_id: selectedLocation
        })
      });
      alert('Location assigned successfully!');
      fetchEmployees();
    } catch (error) {
      alert('Failed to assign location');
    }
    setLoading(false);
  };

  return (
    <div className="assign-locations">
      <h2>Assign Attendance Locations</h2>

      <div className="form-group">
        <label>Select Employee</label>
        <select
          value={selectedEmployee || ''}
          onChange={(e) => setSelectedEmployee(Number(e.target.value))}
        >
          <option value="">Choose an employee...</option>
          {employees.map(emp => (
            <option key={emp.user_id} value={emp.user_id}>
              {emp.employee_id} - {emp.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Select Location</label>
        <select
          value={selectedLocation || ''}
          onChange={(e) => setSelectedLocation(Number(e.target.value))}
        >
          <option value="">Choose a location...</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAssign}
        disabled={loading || !selectedEmployee || !selectedLocation}
        className="btn btn-primary"
      >
        {loading ? 'Assigning...' : 'Assign Location'}
      </button>
    </div>
  );
};

export default AssignLocations;
```

### React Component: Create Location with Map

```typescript
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });

    return markerPosition === null ? null : (
      <Marker position={markerPosition} />
    );
  }

  return (
    <div>
      <p>Click on the map to select location</p>
      <MapContainer
        center={[-1.286389, 36.817223]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      {markerPosition && (
        <div className="mt-2">
          Selected: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
```

---

## Common Use Cases

### Use Case 1: Remote Workers at Home Locations

**Scenario:** 30 employees work remotely from different home locations

**Solution:**
1. Create attendance location for each remote worker's home
2. Use geofence radius of 200-500 meters
3. Assign each employee to their specific location
4. Employee can only check in from their approved home location

**Setup:**
```json
{
  "name": "Remote - John Doe (Karen)",
  "location_coordinates": {
    "latitude": -1.318900,
    "longitude": 36.707200
  },
  "location_radius_meters": 300,
  "branch_id": 1,
  "is_active": true
}
```

---

### Use Case 2: Field Sales Team

**Scenario:** Sales team visits multiple client sites daily

**Solution:**
1. Create attendance locations for all major client sites
2. Set branch to "multiple_locations" mode
3. Sales team can check in from ANY client location
4. Track which locations they visit most

**Setup:**
```json
{
  "branch": {
    "attendance_mode": "multiple_locations"
  },
  "attendance_locations": [
    {"name": "Client A - Westlands", ...},
    {"name": "Client B - CBD", ...},
    {"name": "Client C - Industrial Area", ...}
  ]
}
```

---

### Use Case 3: Multi-Branch Employees

**Scenario:** Employees work at different branches on different days

**Solution:**
1. Assign employee to multiple locations
2. Use recurring shift assignments with location overrides
3. System checks which location they should be at today

**Setup:**
```json
{
  "staff": {
    "user_id": 123,
    "location_assignments": {
      "primary_location": 1,  // Nairobi HQ
      "secondary_locations": [2, 3, 4],  // Other branches
      "schedule": {
        "monday": 1,
        "tuesday": 2,
        "wednesday": 1,
        "thursday": 3,
        "friday": 1
      }
    }
  }
}
```

---

### Use Case 4: Hybrid Workers

**Scenario:** Employees split time between office and home

**Solution:**
1. Create two locations: office + home
2. Assign both locations to employee
3. Employee can check in at either location
4. Track office days vs remote days

**Setup:**
```json
{
  "staff": {
    "user_id": 123,
    "assigned_location_ids": [1, 5],  // Office + Home
    "notes": "Hybrid: Mon/Wed/Fri office, Tue/Thu home"
  }
}
```

---

### Use Case 5: Traveling Employees

**Scenario:** Employee traveling to different cities for work

**Solution:**
1. Create temporary attendance locations for trip duration
2. Assign employee temporarily
3. Deactivate after trip ends

**Setup:**
```json
{
  "name": "Temporary - Mombasa Conference (Mar 15-20)",
  "location_coordinates": {...},
  "location_radius_meters": 200,
  "branch_id": 1,
  "is_active": true,
  "is_temporary": true,
  "valid_from": "2026-03-15",
  "valid_to": "2026-03-20"
}
```

---

## Quick Reference

### Location Assignment Matrix

| Employee Type | Attendance Mode | Location Assignment | Check-in Flexibility |
|--------------|-----------------|---------------------|---------------------|
| Office Worker | branch_based | Via branch_id | Single location (branch) |
| Remote Worker | multiple_locations | assigned_location_id | Specific approved location |
| Field Staff | multiple_locations | Multiple location IDs | Any approved location |
| Hybrid Worker | multiple_locations | 2+ location IDs | Office OR home |
| Traveling Staff | flexible | Temporary assignment | Anywhere (or IP-based) |
| Executive | flexible | None | Anywhere |

---

## Troubleshooting

### Issue: Employee Can't Check In

**Possible Causes:**
1. ❌ Not at assigned location
2. ❌ GPS accuracy too low
3. ❌ Location radius too small
4. ❌ Location not active

**Solutions:**
1. Verify employee is within geofence radius
2. Check GPS signal strength
3. Increase `location_radius_meters`
4. Set `is_active: true`

---

### Issue: Location Verification Failing

**Check:**
1. Coordinates format: `POINT(lng lat)` NOT `POINT(lat lng)`
2. Distance calculation is correct
3. Branch attendance mode matches setup

**Debug Query:**
```sql
SELECT 
  id,
  name,
  ST_Distance_Sphere(
    location_coordinates,
    ST_PointFromText('POINT(36.817223 -1.286389)')
  ) AS distance_meters
FROM attendance_locations
WHERE is_active = TRUE;
```

---

## Summary

### Best Practices

1. **Use descriptive location names**: Include employee name or purpose
2. **Set appropriate radius**: 100-200m for offices, 300-500m for remote
3. **Regular audits**: Deactivate unused locations
4. **Document assignments**: Keep track in staff notes or custom fields
5. **Test geofencing**: Verify locations work before deploying

### Recommended Setup for Your Case

```
Total Employees: 100
├─ Office Workers: 70
│  └─ Location: Nairobi HQ (single location)
│
└─ Remote Workers: 30
   ├─ Employee 1: Home Location A
   ├─ Employee 2: Home Location B
   ├─ Employee 3: Home Location C
   └─ ... (30 unique locations)
```

**Configuration:**
- Branch: `multiple_locations` mode
- Create 31 attendance locations (1 office + 30 remote)
- Assign each employee to their specific location
- Enable location verification
- Set radius: 150m for office, 300m for remote

This gives you full control over where each employee can check in!
