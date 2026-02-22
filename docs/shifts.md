# Shift Management & Recurring Shift Assignments

## Overview

This document describes how to use the Shift Management system for handling **Resume Late** and **Close Early** scenarios using **recurring weekly shift patterns**.

**Note:** For compensatory days off (e.g., working Christmas), use the existing **Leave Management** system with a "Compensatory Leave" leave type. No Time Off Banks needed!

---

## Table of Contents

1. [User Stories](#user-stories)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Use Case: Resume Late / Close Early](#use-case-resume-late--close-early)
5. [Frontend Implementation Guide](#frontend-implementation-guide)
6. [Permission Requirements](#permission-requirements)
7. [Examples](#examples)

---

## User Stories

### US-1: HR Admin Creates Shift Templates

**As an** HR Administrator  
**I want to** create shift templates for common patterns like "Resume Late" and "Close Early"  
**So that** I can quickly assign them to employees

**Acceptance Criteria:**
- HR can create a template with name, start time, end time
- Templates can be marked as active/inactive
- Templates are reusable across multiple employees

---

### US-2: HR Assigns Recurring Shift to Employee

**As an** HR Administrator  
**I want to** assign a recurring shift pattern to an employee (e.g., every Monday)  
**So that** they have a consistent schedule adjustment

**Acceptance Criteria:**
- HR can select an employee
- HR can choose a day of the week (Monday-Friday)
- HR can select a shift template
- HR can set start date and optional end date
- The assignment repeats weekly until the end date

---

### US-3: HR Bulk Assigns Different Days to Multiple Employees

**As an** HR Administrator  
**I want to** assign different days to multiple employees in one operation  
**So that** I can efficiently manage team-wide schedule adjustments

**Example Scenario:**
- Staff A → Resume Late every Monday
- Staff B → Resume Late every Tuesday
- Staff C → Close Early every Wednesday

**Acceptance Criteria:**
- HR can select multiple employees
- Each employee can have a different day of the week
- All assignments are created in a single API call
- HR receives a summary of successful/failed assignments

---

### US-4: Employee Views Their Schedule

**As an** Employee  
**I want to** see my shift schedule including recurring adjustments  
**So that** I know when I'm expected to work

**Acceptance Criteria:**
- Employee can see their weekly schedule
- Recurring shifts are clearly marked
- Standard days vs. adjusted days are differentiated
- Future schedule is visible (based on recurrence end date)

---

### US-5: Attendance Respects Shift Adjustments

**As an** Employee  
**I want** the attendance system to know my adjusted schedule  
**So that** I'm not marked late on my "Resume Late" days

**Acceptance Criteria:**
- On Monday (Resume Late day): Expected at 10:00 instead of 08:00
- On other days: Expected at standard 08:00
- No late marks applied for arriving at 10:15 on Monday
- No early departure marks on "Close Early" days

---

### US-6: HR Updates or Cancels Recurring Shift

**As an** HR Administrator  
**I want to** update or cancel a recurring shift assignment  
**So that** I can respond to changing business needs

**Acceptance Criteria:**
- HR can change the day of the week
- HR can change the shift template
- HR can set an end date to stop recurrence
- HR can cancel the assignment entirely
- Changes affect future dates only (not historical)

---

## Database Schema

### Shift Templates Table

```sql
CREATE TABLE shift_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,              -- e.g., "Resume Late - 2 Hours"
  description TEXT,                         -- e.g., "Resume 2 hours late, same end time"
  start_time TIME NOT NULL,                 -- e.g., "10:00:00"
  end_time TIME NOT NULL,                   -- e.g., "17:00:00"
  break_duration_minutes INT DEFAULT 0,
  effective_from DATE NOT NULL,
  effective_to DATE,
  recurrence_pattern ENUM('daily', 'weekly', 'monthly', 'custom') DEFAULT 'weekly',
  recurrence_days JSON,                     -- e.g., ["monday", "wednesday"]
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Employee Shift Assignments Table (Enhanced)

```sql
CREATE TABLE employee_shift_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  shift_template_id INT,
  custom_start_time TIME,
  custom_end_time TIME,
  custom_break_duration_minutes INT DEFAULT 0,
  effective_from DATE NOT NULL,             -- When the assignment starts
  effective_to DATE,
  assignment_type ENUM('permanent', 'temporary', 'rotating') DEFAULT 'permanent',
  
  -- NEW FIELDS FOR RECURRING SHIFTS
  recurrence_pattern ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
  recurrence_day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
  recurrence_day_of_month INT,              -- For monthly patterns (1-31 or 1-4 for week numbers)
  recurrence_end_date DATE,                 -- When the recurrence stops
  
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  status ENUM('pending', 'approved', 'active', 'expired', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shift_template_id) REFERENCES shift_templates(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  INDEX idx_user_recurrence (user_id, recurrence_pattern, recurrence_day_of_week),
  INDEX idx_recurrence_pattern (recurrence_pattern, recurrence_day_of_week, recurrence_end_date)
);
```

---

## API Endpoints

Base URL: `/api`

### Shift Templates

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/shift-templates` | `shift_template:read` | List all shift templates |
| GET | `/shift-templates/:id` | `shift_template:read` | Get specific template |
| POST | `/shift-templates` | `shift_template:create` | Create new template |
| PUT | `/shift-templates/:id` | `shift_template:update` | Update template |
| DELETE | `/shift-templates/:id` | `shift_template:delete` | Deactivate template |

### Employee Shift Assignments (Standard)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/employee-shift-assignments` | `employee_shift_assignment:read` | List all assignments |
| GET | `/employee-shift-assignments/:id` | `employee_shift_assignment:read` | Get specific assignment |
| POST | `/employee-shift-assignments` | `employee_shift_assignment:create` | Assign shift to employee |
| PUT | `/employee-shift-assignments/:id` | `employee_shift_assignment:update` | Update assignment |
| POST | `/employee-shift-assignments/bulk` | `employee_shift_assignment:create` | Bulk assign same shift |

### Recurring Shift Assignments (NEW)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/recurring-shifts` | `employee_shift_assignment:read` | List recurring shifts |
| POST | `/recurring-shifts/bulk` | `employee_shift_assignment:create` | **Bulk assign different days** |
| PUT | `/recurring-shifts/:id` | `employee_shift_assignment:update` | Update recurring shift |
| DELETE | `/recurring-shifts/:id` | `employee_shift_assignment:update` | Cancel recurring shift |

---

## Use Case: Resume Late / Close Early

### Scenario Overview

Your company allows staff to have recurring schedule adjustments:
- **Resume Late**: Come in 2 hours late, one day per week (e.g., every Monday)
- **Close Early**: Leave 3 hours early, one day per week (e.g., every Wednesday)

Each employee has their own designated day, and this repeats weekly.

---

### Step 1: Create Shift Templates (One-Time Setup)

**Endpoint:** `POST /api/shift-templates`

**Request:**
```json
{
  "name": "Resume Late - 2 Hours",
  "description": "Resume work 2 hours late, standard end time",
  "start_time": "10:00:00",
  "end_time": "17:00:00",
  "break_duration_minutes": 60,
  "effective_from": "2026-02-23",
  "recurrence_pattern": "weekly",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shift template created successfully",
  "data": {
    "shiftTemplate": {
      "id": 5,
      "name": "Resume Late - 2 Hours",
      "start_time": "10:00:00",
      "end_time": "17:00:00",
      "is_active": true
    }
  }
}
```

**Create Second Template for Close Early:**
```json
{
  "name": "Close Early - 3 Hours",
  "description": "Standard start time, leave 3 hours early",
  "start_time": "08:00:00",
  "end_time": "14:00:00",
  "break_duration_minutes": 30,
  "effective_from": "2026-02-23",
  "recurrence_pattern": "weekly",
  "is_active": true
}
```

**Result:** You now have two templates:
- Template ID 5: Resume Late (10:00-17:00)
- Template ID 6: Close Early (08:00-14:00)

---

### Step 2: Bulk Assign Recurring Shifts to Multiple Employees

**Endpoint:** `POST /api/recurring-shifts/bulk`

**Use Case:** Assign different days to different employees

**Request:**
```json
{
  "assignments": [
    {
      "user_id": 123,
      "shift_template_id": 5,
      "day_of_week": "monday",
      "start_date": "2026-02-23",
      "end_date": "2026-12-31",
      "notes": "Resume Late - Team Lead Meeting Sundays"
    },
    {
      "user_id": 456,
      "shift_template_id": 5,
      "day_of_week": "tuesday",
      "start_date": "2026-02-24",
      "end_date": "2026-12-31",
      "notes": "Resume Late - Childcare"
    },
    {
      "user_id": 789,
      "shift_template_id": 6,
      "day_of_week": "wednesday",
      "start_date": "2026-02-25",
      "end_date": "2026-12-31",
      "notes": "Close Early - Weekly Appointment"
    },
    {
      "user_id": 101,
      "shift_template_id": 6,
      "day_of_week": "thursday",
      "start_date": "2026-02-26",
      "end_date": "2026-12-31",
      "notes": "Close Early - Classes"
    },
    {
      "user_id": 102,
      "shift_template_id": 5,
      "day_of_week": "friday",
      "start_date": "2026-02-27",
      "end_date": "2026-12-31",
      "notes": "Resume Late - Personal"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk recurring shift assignment completed. 5 succeeded, 0 failed.",
  "data": {
    "results": [
      {
        "user_id": 123,
        "success": true,
        "assignment": {
          "id": 1001,
          "user_id": 123,
          "user_name": "John Doe",
          "template_name": "Resume Late - 2 Hours",
          "start_time": "10:00:00",
          "end_time": "17:00:00",
          "recurrence_pattern": "weekly",
          "recurrence_day_of_week": "monday",
          "effective_from": "2026-02-23",
          "recurrence_end_date": "2026-12-31",
          "status": "active"
        }
      },
      // ... more results
    ],
    "summary": {
      "total": 5,
      "successful": 5,
      "failed": 0
    }
  }
}
```

---

### Step 3: Employee Views Their Schedule

**Endpoint:** `GET /api/employee-shift-assignments?userId=123`

**Response for John Doe (Monday is his Resume Late day):**
```json
{
  "success": true,
  "data": {
    "shiftAssignments": [
      {
        "id": 1001,
        "user_id": 123,
        "template_name": "Resume Late - 2 Hours",
        "start_time": "10:00:00",
        "end_time": "17:00:00",
        "recurrence_pattern": "weekly",
        "recurrence_day_of_week": "monday",
        "effective_from": "2026-02-23",
        "recurrence_end_date": "2026-12-31",
        "status": "active"
      },
      {
        "id": 500,
        "user_id": 123,
        "template_name": "Standard Shift",
        "start_time": "08:00:00",
        "end_time": "17:00:00",
        "recurrence_pattern": "none",
        "assignment_type": "permanent",
        "status": "active"
      }
    ]
  }
}
```

**Frontend Logic:**
```javascript
// Determine schedule for a specific date
function getScheduleForDate(assignments, targetDate) {
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  // Find recurring assignment for this day of week
  const recurringAssignment = assignments.find(a => 
    a.recurrence_pattern === 'weekly' && 
    a.recurrence_day_of_week === dayOfWeek &&
    a.status === 'active' &&
    new Date(a.effective_from) <= targetDate &&
    (!a.recurrence_end_date || new Date(a.recurrence_end_date) >= targetDate)
  );
  
  if (recurringAssignment) {
    return {
      start_time: recurringAssignment.start_time,
      end_time: recurringAssignment.end_time,
      type: recurringAssignment.template_name,
      isAdjusted: true
    };
  }
  
  // Fall back to standard/permanent assignment
  const standardAssignment = assignments.find(a => 
    a.assignment_type === 'permanent' && a.status === 'active'
  );
  
  return {
    start_time: standardAssignment.start_time,
    end_time: standardAssignment.end_time,
    type: 'Standard Shift',
    isAdjusted: false
  };
}
```

---

### Step 4: Attendance Integration

When an employee clocks in, the attendance system checks their shift assignment for that specific date.

**Example: John Doe clocks in on Monday at 10:12**

**Backend Query:**
```sql
SELECT 
  st.start_time,
  st.end_time,
  esa.recurrence_pattern,
  esa.recurrence_day_of_week
FROM employee_shift_assignments esa
JOIN shift_templates st ON esa.shift_template_id = st.id
WHERE esa.user_id = 123
  AND esa.status = 'active'
  AND (
    (esa.recurrence_pattern = 'weekly' AND esa.recurrence_day_of_week = 'monday')
    OR
    (esa.recurrence_pattern = 'none' AND esa.assignment_type = 'permanent')
  )
```

**Result:**
```
start_time: 10:00:00
end_time: 17:00:00
recurrence_pattern: weekly
recurrence_day_of_week: monday
```

**Attendance Status:**
- Clock In: 10:12
- Expected: 10:00
- Grace Period: 15 minutes
- **Status: ON TIME** ✓ (no late mark)

**On Tuesday (standard day):**
- Clock In: 10:12
- Expected: 08:00
- **Status: LATE** ⚠️ (2 hours late, late mark applied)

---

## Frontend Implementation Guide

### Component Structure

```
src/
├── components/
│   ├── shifts/
│   │   ├── ShiftTemplateList.tsx
│   │   ├── ShiftTemplateForm.tsx
│   │   ├── RecurringShiftAssignment.tsx
│   │   ├── BulkRecurringShiftForm.tsx
│   │   ├── EmployeeScheduleView.tsx
│   │   └── WeeklyScheduleCalendar.tsx
│   └── ...
```

---

### React Component: BulkRecurringShiftForm

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Assignment {
  user_id: number;
  shift_template_id: number;
  day_of_week: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

interface ShiftTemplate {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

interface Employee {
  id: number;
  full_name: string;
  email: string;
}

const BulkRecurringShiftForm: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { user_id: 0, shift_template_id: 0, day_of_week: 'monday', start_date: '', end_date: '' }
  ]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  useEffect(() => {
    fetchTemplates();
    fetchEmployees();
  }, []);

  const fetchTemplates = async () => {
    const response = await axios.get('/api/shift-templates?isActive=true');
    setTemplates(response.data.data.shiftTemplates);
  };

  const fetchEmployees = async () => {
    const response = await axios.get('/api/staff');
    setEmployees(response.data.data.staff);
  };

  const addAssignment = () => {
    setAssignments([
      ...assignments,
      { user_id: 0, shift_template_id: 0, day_of_week: 'monday', start_date: '', end_date: '' }
    ]);
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const updateAssignment = (index: number, field: keyof Assignment, value: any) => {
    const updated = [...assignments];
    updated[index][field] = value;
    setAssignments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/recurring-shifts/bulk', { assignments });
      setResult(response.data);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Assignment failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-recurring-shift-form">
      <h2>Assign Recurring Shifts</h2>
      
      <form onSubmit={handleSubmit}>
        {assignments.map((assignment, index) => (
          <div key={index} className="assignment-row">
            <h3>Assignment {index + 1}</h3>
            
            <div className="form-group">
              <label>Employee</label>
              <select
                value={assignment.user_id}
                onChange={(e) => updateAssignment(index, 'user_id', parseInt(e.target.value))}
                required
              >
                <option value={0}>Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Shift Template</label>
              <select
                value={assignment.shift_template_id}
                onChange={(e) => updateAssignment(index, 'shift_template_id', parseInt(e.target.value))}
                required
              >
                <option value={0}>Select Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.start_time} - {template.end_time})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Day of Week</label>
              <select
                value={assignment.day_of_week}
                onChange={(e) => updateAssignment(index, 'day_of_week', e.target.value)}
                required
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={assignment.start_date}
                onChange={(e) => updateAssignment(index, 'start_date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date (Optional)</label>
              <input
                type="date"
                value={assignment.end_date}
                onChange={(e) => updateAssignment(index, 'end_date', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <input
                type="text"
                value={assignment.notes || ''}
                onChange={(e) => updateAssignment(index, 'notes', e.target.value)}
                placeholder="Optional notes"
              />
            </div>

            {assignments.length > 1 && (
              <button type="button" onClick={() => removeAssignment(index)}>
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={addAssignment}>
            + Add Another Assignment
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign All'}
          </button>
        </div>
      </form>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          <h3>{result.success ? 'Success!' : 'Error'}</h3>
          <p>{result.message}</p>
          {result.data?.summary && (
            <div className="summary">
              <p>Total: {result.data.summary.total}</p>
              <p>Successful: {result.data.summary.successful}</p>
              <p>Failed: {result.data.summary.failed}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkRecurringShiftForm;
```

---

### React Component: EmployeeScheduleView

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ShiftAssignment {
  id: number;
  template_name: string;
  start_time: string;
  end_time: string;
  recurrence_pattern: string;
  recurrence_day_of_week?: string;
  effective_from: string;
  recurrence_end_date?: string;
  status: string;
}

const EmployeeScheduleView: React.FC = () => {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get('/api/employee-shift-assignments');
      const activeAssignments = response.data.data.shiftAssignments.filter(
        (a: ShiftAssignment) => a.status === 'active'
      );
      setAssignments(activeAssignments);
      calculateWeeklySchedule(activeAssignments);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklySchedule = (assignments: ShiftAssignment[]) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule: any = {};

    // Find standard/permanent shift
    const standardShift = assignments.find(
      a => a.recurrence_pattern === 'none' && a.assignment_type === 'permanent'
    );

    // Initialize all days with standard shift
    days.forEach(day => {
      schedule[day] = {
        start_time: standardShift?.start_time || '08:00',
        end_time: standardShift?.end_time || '17:00',
        template_name: standardShift?.template_name || 'Standard Shift',
        isAdjusted: false
      };
    });

    // Override with recurring shifts
    assignments.forEach(assignment => {
      if (assignment.recurrence_pattern === 'weekly' && assignment.recurrence_day_of_week) {
        schedule[assignment.recurrence_day_of_week] = {
          start_time: assignment.start_time,
          end_time: assignment.end_time,
          template_name: assignment.template_name,
          isAdjusted: true
        };
      }
    });

    setWeeklySchedule(schedule);
  };

  if (loading) return <div>Loading schedule...</div>;

  return (
    <div className="employee-schedule-view">
      <h2>My Weekly Schedule</h2>
      
      <div className="schedule-grid">
        {Object.entries(weeklySchedule).map(([day, schedule]: [string, any]) => (
          <div 
            key={day} 
            className={`schedule-day ${schedule.isAdjusted ? 'adjusted' : 'standard'}`}
          >
            <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
            <div className="schedule-time">
              <span className="start-time">{schedule.start_time}</span>
              <span>to</span>
              <span className="end-time">{schedule.end_time}</span>
            </div>
            <div className="schedule-type">
              {schedule.isAdjusted ? (
                <span className="badge adjusted">{schedule.template_name}</span>
              ) : (
                <span className="badge standard">Standard</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="schedule-legend">
        <div className="legend-item">
          <span className="badge standard">Standard</span>
          <span>Regular shift</span>
        </div>
        <div className="legend-item">
          <span className="badge adjusted">Adjusted</span>
          <span>Schedule adjustment</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeScheduleView;
```

---

### React Component: WeeklyScheduleCalendar (HR View)

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RecurringShift {
  id: number;
  user_id: number;
  user_name: string;
  template_name: string;
  start_time: string;
  end_time: string;
  recurrence_day_of_week: string;
  status: string;
}

const WeeklyScheduleCalendar: React.FC = () => {
  const [shifts, setShifts] = useState<RecurringShift[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  useEffect(() => {
    fetchRecurringShifts();
  }, []);

  const fetchRecurringShifts = async () => {
    try {
      const response = await axios.get('/api/recurring-shifts?limit=100');
      setShifts(response.data.data.recurringShifts);
    } catch (error) {
      console.error('Error fetching recurring shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftsForDay = (day: string) => {
    return shifts.filter(shift => 
      shift.recurrence_day_of_week === day && shift.status === 'active'
    );
  };

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div className="weekly-schedule-calendar">
      <h2>Weekly Schedule Calendar</h2>
      
      <div className="calendar-grid">
        <div className="calendar-header">
          {days.map(day => (
            <div key={day} className="calendar-day-header">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </div>
          ))}
        </div>

        <div className="calendar-body">
          {days.map(day => (
            <div key={day} className="calendar-day-column">
              {getShiftsForDay(day).map(shift => (
                <div key={shift.id} className="calendar-shift-card">
                  <div className="employee-name">{shift.user_name}</div>
                  <div className="shift-details">
                    <span className="shift-time">
                      {shift.start_time} - {shift.end_time}
                    </span>
                    <span className="shift-type">{shift.template_name}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyScheduleCalendar;
```

---

## Permission Requirements

| Role | Permissions Needed | Access Level |
|------|-------------------|--------------|
| **HR Admin** | `shift_template:*`, `employee_shift_assignment:*` | Full access to create, assign, update |
| **Manager** | `employee_shift_assignment:read` | View team schedules only |
| **Employee** | `employee_shift_assignment:read` (own) | View own schedule only |

### Frontend Permission Check Example

```typescript
// Permission gate component
const PermissionGate: React.FC<{
  required: string;
  children: React.ReactNode;
}> = ({ required, children }) => {
  const { permissions } = useAuth(); // Get permissions from context
  
  if (permissions?.[required]) {
    return <>{children}</>;
  }
  
  return null;
};

// Usage in HR Dashboard
<PermissionGate required="employee_shift_assignment:create">
  <BulkRecurringShiftForm />
</PermissionGate>

// Usage in Employee Dashboard
<PermissionGate required="employee_shift_assignment:read">
  <EmployeeScheduleView />
</PermissionGate>
```

---

## Examples

### Example 1: Single Employee - Resume Late Every Monday

**Request:**
```json
POST /api/recurring-shifts/bulk
{
  "assignments": [
    {
      "user_id": 123,
      "shift_template_id": 5,
      "day_of_week": "monday",
      "start_date": "2026-02-23",
      "end_date": "2026-12-31",
      "notes": "Resume Late - Personal"
    }
  ]
}
```

---

### Example 2: Update Recurring Shift (Change Day)

**Scenario:** John needs to change from Monday to Thursday

**Step 1: Get the assignment ID**
```bash
GET /api/recurring-shifts?userId=123
```

**Step 2: Update the day**
```json
PUT /api/recurring-shifts/1001
{
  "recurrence_day_of_week": "thursday",
  "notes": "Changed from Monday to Thursday"
}
```

---

### Example 3: Cancel Recurring Shift

**Scenario:** Mary no longer needs the schedule adjustment

```bash
DELETE /api/recurring-shifts/1005
```

**Response:**
```json
{
  "success": true,
  "message": "Recurring shift assignment cancelled successfully"
}
```

---

### Example 4: View All Recurring Shifts by Day

**HR wants to see who has which day:**

```bash
GET /api/recurring-shifts?dayOfWeek=monday
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recurringShifts": [
      {
        "id": 1001,
        "user_name": "John Doe",
        "template_name": "Resume Late - 2 Hours",
        "start_time": "10:00:00",
        "end_time": "17:00:00",
        "recurrence_day_of_week": "monday"
      },
      {
        "id": 1012,
        "user_name": "Alice Smith",
        "template_name": "Resume Late - 2 Hours",
        "start_time": "10:00:00",
        "end_time": "17:00:00",
        "recurrence_day_of_week": "monday"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalItems": 2
    }
  }
}
```

---

## Migration Instructions

### Run the Migration

```bash
# Navigate to migrations directory
cd migrations

# Run the migration
mysql -u your_user -p your_database < 078_add_recurring_shift_fields.sql
```

### Verify Migration

```sql
-- Check new columns exist
DESCRIBE employee_shift_assignments;

-- Should show:
-- recurrence_pattern
-- recurrence_day_of_week
-- recurrence_day_of_month
-- recurrence_end_date
```

---

## Testing Checklist

- [ ] Migration applied successfully
- [ ] Create "Resume Late" shift template
- [ ] Create "Close Early" shift template
- [ ] Assign recurring shift to single employee
- [ ] Bulk assign different days to multiple employees
- [ ] Employee can view their schedule
- [ ] Attendance respects adjusted schedule
- [ ] HR can update recurring shift day
- [ ] HR can cancel recurring shift
- [ ] Permissions enforced correctly

---

## Troubleshooting

### Issue: Recurring shifts not showing in schedule

**Check:**
1. Assignment status is 'active'
2. Current date is between `effective_from` and `recurrence_end_date`
3. `recurrence_pattern` is set to 'weekly'

### Issue: Attendance marking as late on adjusted day

**Check:**
1. Shift assignment exists for that day of week
2. `ShiftSchedulingService.processAttendanceForDate()` is being called
3. Attendance query joins with `employee_shift_assignments`

### Issue: Bulk assignment fails for some employees

**Check:**
1. All user IDs exist in the database
2. All shift template IDs are active
3. Date format is YYYY-MM-DD
4. Day of week is lowercase (monday, tuesday, etc.)

---

## Support

For issues or questions:
1. Check the API response error messages
2. Review the database schema matches this documentation
3. Verify permissions are correctly assigned
4. Check server logs for detailed error messages

---

**Last Updated:** February 20, 2026  
**Version:** 1.0  
**Author:** HR Development Team
