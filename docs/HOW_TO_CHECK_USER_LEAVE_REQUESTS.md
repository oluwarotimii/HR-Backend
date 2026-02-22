# How to Check a User's Past Leave Requests

## Quick Answer

There are **two ways** to check leave requests for a specific user:

---

## Method 1: Get Current User's Own Requests (No Permission Required)

**Endpoint:** `GET /api/leave/my-requests`

**Use Case:** Employee checking their own leave history

**Example:**
```bash
GET http://localhost:3000/api/leave/my-requests
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Your leave requests retrieved successfully",
  "data": {
    "leaveRequests": [
      {
        "id": 1,
        "user_id": 1,
        "leave_type_id": 1,
        "start_date": "2026-03-01",
        "end_date": "2026-03-03",
        "days_requested": 3,
        "reason": "Family vacation",
        "status": "approved",
        "created_at": "2026-02-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  }
}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by status: `submitted`, `approved`, `rejected`, `cancelled` |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |

**Examples:**

1. **Get my approved requests:**
   ```
   GET /api/leave/my-requests?status=approved
   ```

2. **Get my pending requests:**
   ```
   GET /api/leave/my-requests?status=submitted
   ```

3. **Get my requests with pagination:**
   ```
   GET /api/leave/my-requests?page=1&limit=10
   ```

---

## Method 2: Get Specific User's Requests (HR/Admin Only)

**Endpoint:** `GET /api/leave/requests?userId={USER_ID}`

**Use Case:** HR or manager checking an employee's leave history

**Required Permission:** `leave:read`

**Example:**
```bash
GET http://localhost:3000/api/leave/requests?userId=1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Leave requests retrieved successfully",
  "data": {
    "leaveRequests": [
      {
        "id": 1,
        "user_id": 1,
        "leave_type_id": 1,
        "start_date": "2026-03-01",
        "end_date": "2026-03-03",
        "days_requested": 3,
        "reason": "Family vacation",
        "status": "approved",
        "user_name": "John Doe",
        "leave_type_name": "Annual Leave",
        "created_at": "2026-02-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  }
}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | number | - | **Required** - The user ID to filter by |
| `status` | string | - | Filter by status: `submitted`, `approved`, `rejected`, `cancelled` |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |

**Examples:**

1. **Get user 1's approved requests:**
   ```
   GET /api/leave/requests?userId=1&status=approved
   ```

2. **Get user 1's pending requests:**
   ```
   GET /api/leave/requests?userId=1&status=submitted
   ```

3. **Get user 1's rejected requests:**
   ```
   GET /api/leave/requests?userId=1&status=rejected
   ```

4. **Get user 1's requests with pagination:**
   ```
   GET /api/leave/requests?userId=1&page=1&limit=10
   ```

---

## Comparison Table

| Feature | `/my-requests` | `/requests?userId=X` |
|---------|---------------|---------------------|
| **Who can use?** | Any authenticated user | HR/Admin only |
| **Permission needed?** | No | Yes (`leave:read`) |
| **Returns** | Current user's requests | Specific user's requests |
| **User ID in URL?** | No (auto-detected from token) | Yes (manual) |
| **Includes user_name?** | No | Yes |
| **Includes leave_type_name?** | No | Yes |

---

## Using Postman

### Import the Collection

1. Open Postman
2. Click **Import**
3. Select file: `postman/leave-requests-user-specific.postman_collection.json`
4. Collection imported!

### Set Variables

In Postman, set these variables:
- `base_url`: `http://localhost:3000`
- `access_token`: Your JWT token from login

### Test Scenarios

#### Scenario 1: Employee Checks Their Own Requests

1. Login as employee
2. Get access token
3. Request: `GET /api/leave/my-requests`
4. See all your leave requests

#### Scenario 2: HR Checks Employee's Requests

1. Login as HR admin
2. Get access token
3. Request: `GET /api/leave/requests?userId=1`
4. See all leave requests for user ID 1

#### Scenario 3: HR Checks Only Approved Requests

1. Login as HR admin
2. Get access token
3. Request: `GET /api/leave/requests?userId=1&status=approved`
4. See only approved requests for user ID 1

---

## Frontend Implementation

### React Component: UserLeaveHistory

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LeaveRequest {
  id: number;
  user_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: 'submitted' | 'approved' | 'rejected' | 'cancelled';
  leave_type_name?: string;
  user_name?: string;
  created_at: string;
}

interface UserLeaveHistoryProps {
  userId?: number;  // If not provided, shows current user's requests
  isHR?: boolean;   // If true, can view other users' requests
}

const UserLeaveHistory: React.FC<UserLeaveHistoryProps> = ({ 
  userId, 
  isHR = false 
}) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeaveRequests();
  }, [userId, statusFilter]);

  const fetchLeaveRequests = async () => {
    try {
      let url;
      
      if (userId && isHR) {
        // HR viewing specific user's requests
        url = `/api/leave/requests?userId=${userId}`;
      } else {
        // User viewing their own requests
        url = '/api/leave/my-requests';
      }

      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const response = await axios.get(url);
      setRequests(response.data.data.leaveRequests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      submitted: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      cancelled: 'badge-secondary'
    };
    return classes[status] || 'badge-default';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-leave-history">
      <h2>
        {userId && isHR ? 'Employee Leave History' : 'My Leave History'}
      </h2>

      <div className="filters">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="submitted">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <table className="leave-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(request => (
            <tr key={request.id}>
              <td>{request.leave_type_name || 'Leave'}</td>
              <td>{new Date(request.start_date).toLocaleDateString()}</td>
              <td>{new Date(request.end_date).toLocaleDateString()}</td>
              <td>{request.days_requested}</td>
              <td>{request.reason}</td>
              <td>
                <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                  {request.status.toUpperCase()}
                </span>
              </td>
              <td>{new Date(request.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {requests.length === 0 && (
        <p className="no-data">No leave requests found</p>
      )}
    </div>
  );
};

export default UserLeaveHistory;
```

### Usage Examples

```typescript
// Employee views their own history
<UserLeaveHistory />

// HR views specific employee's history
<UserLeaveHistory userId={123} isHR={true} />

// Manager views team member's history
<UserLeaveHistory userId={456} isHR={false} />
```

---

## Troubleshooting

### Error: "Unknown column 'lr.user_id' in 'where clause'"

**Cause:** The `leave_requests` table doesn't exist or has wrong schema.

**Solution:**
```bash
# Run the migration
mysql -u your_user -p your_database < migrations/077_create_leave_requests_table.sql

# OR run the fix script
mysql -u your_user -p your_database < migrations/fix_leave_requests.sql
```

### Error: "Insufficient permissions. Required: leave:read"

**Cause:** Trying to access `/api/leave/requests` without `leave:read` permission.

**Solution:**
- Use `/api/leave/my-requests` instead (no permission needed)
- OR grant `leave:read` permission to the user's role

### Error: "Invalid pagination parameters"

**Cause:** Invalid `page` or `limit` values.

**Solution:**
- Ensure `page >= 1`
- Ensure `limit >= 1` and `limit <= 100`

---

## API Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Leave requests retrieved successfully",
  "data": {
    "leaveRequests": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "itemsPerPage": 20
    }
  }
}
```

### Error Response (403 Forbidden)

```json
{
  "success": false,
  "message": "Insufficient permissions. Required: leave:read",
  "requiredPermission": "leave:read",
  "permissionSource": "none"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Database Schema

### leave_requests Table

```sql
CREATE TABLE leave_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,              -- The employee who requested leave
  leave_type_id INT NOT NULL,        -- Type of leave (Annual, Sick, etc.)
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INT NOT NULL,
  reason TEXT NOT NULL,
  attachments JSON,                  -- Optional attachments
  status ENUM('submitted', 'approved', 'rejected', 'cancelled') DEFAULT 'submitted',
  reviewed_by INT,                   -- User who reviewed (HR/Manager)
  reviewed_at TIMESTAMP NULL,
  notes TEXT,                        -- Reviewer notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  
  INDEX idx_user_id (user_id),       -- Fast lookup by user
  INDEX idx_status (status),         -- Fast filtering by status
  INDEX idx_dates (start_date, end_date)
);
```

---

## Summary

| To Check... | Use This Endpoint | Permission |
|-------------|------------------|------------|
| **My own requests** | `GET /api/leave/my-requests` | None |
| **My approved requests** | `GET /api/leave/my-requests?status=approved` | None |
| **My pending requests** | `GET /api/leave/my-requests?status=submitted` | None |
| **Employee's requests (HR)** | `GET /api/leave/requests?userId=123` | `leave:read` |
| **Employee's approved (HR)** | `GET /api/leave/requests?userId=123&status=approved` | `leave:read` |
| **Employee's pending (HR)** | `GET /api/leave/requests?userId=123&status=submitted` | `leave:read` |

---

**Last Updated:** February 20, 2026  
**Status:** ✅ Ready to Use
