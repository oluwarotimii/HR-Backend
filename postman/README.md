# Postman Collections - HR Management System

Complete API documentation and testing collections for the HR Management System.

---

## 📚 Collection Structure

### Environment (Import First!)

**File:** `00_HR_System_Environment.postman_environment.json`

Contains:
- Base URL configuration
- Token storage variables
- Common IDs (user, role, branch, etc.)
- Test credentials

**Setup:**
1. Import this file first
2. Set `base_url` to `http://localhost:3000`
3. Update credentials if needed

---

### Module Collections

#### 01 - Authentication & Users
**File:** `01_Authentication_Users_Roles.postman_collection.json`

**Endpoints:**
- Login / Logout / Refresh Token
- Get Current User
- Change Password / Reset Password
- User CRUD operations
- Role management
- Permissions management

**Test Flow:**
1. Login (saves token automatically)
2. Get current user
3. Test user management endpoints
4. Test role management

---

#### 02 - Staff Management & Invitations
**File:** `02_Staff_Management.postman_collection.json`

**Endpoints:**
- Send staff invitation
- Get all/pending invitations
- Resend/Cancel invitation
- Accept invitation (public)
- Staff CRUD operations
- Dynamic fields management

**Test Flow:**
1. Send invitation
2. View pending invitations
3. Accept invitation (public endpoint)
4. Manage staff records

---

#### 03 - Leave Management (Complete)
**File:** `03_Leave_Management.postman_collection.json`

**Endpoints:**
- Leave types CRUD
- Submit leave request
- Approve/Reject leave
- Get leave balance (with pending tracking)
- File upload/download/delete
- Leave allocations (single/bulk/all)

**Test Flow:**
1. Get leave types
2. Get leave balance
3. Upload files (optional)
4. Submit leave request with attachments
5. Approve/reject request (as manager)
6. Verify balance updated

**Features Tested:**
- Pending request balance deduction
- Transaction-based approval
- File attachments
- Notifications (check email queue)

---

## 🚀 Quick Start

### 1. Import Collections

1. Open Postman
2. Click Import
3. Select all `.json` files from this folder
4. Import environment file first

### 2. Configure Environment

1. Select "HR Management System - Environment" from dropdown
2. Set `base_url` to `http://localhost:3000`
3. Keep default credentials or update

### 3. Test Authentication

1. Open "01 - Authentication & Users" collection
2. Run "Login" request
3. Token automatically saved to environment
4. Try other authenticated requests

### 4. Test Modules

Follow the test flow in each collection's description.

---

## 🔑 Test Credentials

After running `pnpm seed`:

```
Admin:
Email: admin@company.co.ke
Password: Password123!

Employee:
Email: john.doe1@company.co.ke
Password: Password123!
```

---

## 📝 Request/Response Examples

### Login Request

```json
POST /api/auth/login
{
  "email": "admin@company.co.ke",
  "password": "Password123!"
}
```

### Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@company.co.ke",
      "full_name": "System Administrator",
      "role_name": "Admin"
    }
  }
}
```

### Leave Request Submission

```json
POST /api/leave
{
  "leave_type_id": 1,
  "start_date": "2026-03-15",
  "end_date": "2026-03-20",
  "reason": "Family vacation",
  "attachments": [
    {
      "file_name": "flight_booking.pdf",
      "file_path": "/uploads/leave-requests/leave-123.pdf",
      "file_size": 245678,
      "mime_type": "application/pdf"
    }
  ]
}
```

### Leave Balance Response

```json
{
  "success": true,
  "data": {
    "balances": [
      {
        "leave_type_id": 1,
        "leave_type_name": "Annual Leave",
        "allocated_days": 20,
        "used_days": 5,
        "pending_days": 3,
        "remaining_days": 12,
        "cycle_start_date": "2026-01-01",
        "cycle_end_date": "2026-12-31"
      }
    ]
  }
}
```

---

## 🧪 Testing Workflows

### Complete Leave Management Flow

```
1. Login as Employee
   ↓
2. GET /api/leave/balance (check available days)
   ↓
3. POST /api/leave/upload (attach documents - optional)
   ↓
4. POST /api/leave (submit request with attachments)
   ↓
5. GET /api/leave/my-requests (verify submission)
   ↓
6. Logout
   ↓
7. Login as Manager
   ↓
8. GET /api/leave?status=submitted (view pending)
   ↓
9. PUT /api/leave/:id (approve/reject)
   ↓
10. Logout
    ↓
11. Login as Employee
    ↓
12. GET /api/leave/my-requests (verify status changed)
    ↓
13. GET /api/leave/balance (verify days deducted)
```

### Staff Invitation Flow

```
1. Login as Admin/HR
   ↓
2. GET /api/staff-invitation/roles (get role options)
   ↓
3. GET /api/staff-invitation/branches (get branch options)
   ↓
4. GET /api/staff-invitation/departments (get dept options)
   ↓
5. POST /api/staff-invitation (send invitation)
   ↓
6. GET /api/staff-invitations/pending (verify invitation created)
   ↓
7. Copy invitation token from database
   ↓
8. POST /api/staff-invitations/accept/:token (accept as candidate)
   ↓
9. Login with new work email
   ↓
10. GET /api/staff/me (verify staff record created)
```

---

## ⚠️ Important Notes

### Authentication

- All requests (except login, accept invitation, password reset) require `Authorization: Bearer {{access_token}}` header
- Token is automatically saved after successful login
- If you get 401 Unauthorized, re-run the Login request

### File Uploads

- Use Postman's "form-data" body type
- Key must be `files` (plural)
- Select "File" type for the value
- Can upload multiple files at once (max 5)

### Variable Usage

- `{{base_url}}` - Server URL
- `{{access_token}}` - JWT token (auto-saved)
- `{{user_id}}`, `{{staff_id}}`, etc. - Resource IDs
- Update IDs in environment after creating resources

### Error Handling

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔧 Troubleshooting

### 401 Unauthorized
- Token expired → Re-run Login request
- Token not set → Check environment variables

### 403 Forbidden
- Missing permission → Login with different user
- Check user has required permission

### 404 Not Found
- Wrong ID in URL → Update environment variable
- Endpoint doesn't exist → Check collection is up to date

### 500 Internal Server Error
- Server issue → Check server logs
- Database not seeded → Run `pnpm seed`

---

## 📞 Additional Resources

- **API Documentation:** `docs/LEAVE_MODULE_API_DOCUMENTATION.md`
- **File Upload Guide:** `docs/LEAVE_REQUEST_FILE_UPLOAD_GUIDE.md`
- **Backend Guidelines:** `.qwen/GUIDELINES.md`
- **Environment Setup:** `.qwen/SETUP_CHECKLIST.md`

---

**Last Updated:** February 26, 2026
**Collections Version:** 1.0.0
