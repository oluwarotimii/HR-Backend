# Postman Collections Summary

## ✅ Created Collections

| # | Collection | File | Endpoints | Status |
|---|------------|------|-----------|--------|
| 0 | **Environment** | `00_HR_System_Environment.postman_environment.json` | Variables & Config | ✅ Complete |
| 1 | **Authentication & Users** | `01_Authentication_Users_Roles.postman_collection.json` | 20+ endpoints | ✅ Complete |
| 2 | **Staff Management** | `02_Staff_Management.postman_collection.json` | 25+ endpoints | ✅ Complete |
| 3 | **Leave Management** | `03_Leave_Management.postman_collection.json` | 35+ endpoints | ✅ Complete |

---

## 📊 Coverage

### Module 0: Environment Variables
- ✅ Base URL configuration
- ✅ Token storage (access_token, refresh_token)
- ✅ Test credentials (admin_email, admin_password)
- ✅ Resource IDs (user_id, staff_id, role_id, branch_id, etc.)
- ✅ Invitation tracking (invitation_id, invitation_token)

### Module 1: Authentication & Users
**Authentication:**
- ✅ Login (with auto-save token)
- ✅ Logout
- ✅ Refresh Token (with auto-save)
- ✅ Get Current User
- ✅ Change Password
- ✅ Request Password Reset
- ✅ Reset Password

**User Management:**
- ✅ Get All Users (with pagination)
- ✅ Get User by ID
- ✅ Create User
- ✅ Update User
- ✅ Delete User
- ✅ Get User Permissions

**Roles & Permissions:**
- ✅ Get All Roles
- ✅ Get Role by ID (with permissions)
- ✅ Create Role (with permissions)
- ✅ Update Role
- ✅ Delete Role
- ✅ Get All Permissions

### Module 2: Staff Management & Invitations
**Staff Invitations:**
- ✅ Send Invitation (creates token record)
- ✅ Get All Invitations
- ✅ Get Pending Invitations
- ✅ Resend Invitation (new token + reset expiry)
- ✅ Cancel Invitation
- ✅ Accept Invitation (public, no auth, sets password)
- ✅ Get Available Roles (for form)
- ✅ Get Available Branches (for form)
- ✅ Get Available Departments (for form)

**Staff Management:**
- ✅ Get All Staff (with filters)
- ✅ Get Staff by ID
- ✅ Get My Staff Details
- ✅ Create Staff
- ✅ Update Staff
- ✅ Delete Staff
- ✅ Terminate Staff
- ✅ Get Staff by Department
- ✅ Dynamic Fields CRUD
- ✅ Staff Dynamic Values CRUD

### Module 3: Leave Management
**Leave Types:**
- ✅ Get All Leave Types
- ✅ Get Leave Type by ID
- ✅ Create Leave Type
- ✅ Update Leave Type
- ✅ Delete Leave Type

**Leave Requests:**
- ✅ Get My Leave Requests
- ✅ Get All Leave Requests (admin, with filters)
- ✅ Get Leave Request by ID
- ✅ Get My Leave Balance (with pending days)
- ✅ Get Leave History
- ✅ Submit Leave Request (with attachments)
- ✅ Approve Leave Request (transaction-based)
- ✅ Reject Leave Request (with notification)
- ✅ Cancel Leave Request (refund days)

**File Uploads:**
- ✅ Upload Files (multipart, max 5 files, 5MB)
- ✅ Get Files for Leave Request
- ✅ Delete File from Leave Request
- ✅ Download File (public endpoint)

**Leave Allocations:**
- ✅ Get My Allocations
- ✅ Get All Allocations (with filters)
- ✅ Get Allocation by ID
- ✅ Allocate Leave to User
- ✅ Bulk Allocate Leave (multiple users)
- ✅ Allocate to ALL Active Users
- ✅ Update Allocation
- ✅ Delete Allocation

---

## 🎯 Key Features Tested

### Authentication Flow
- JWT token-based authentication
- Automatic token saving to environment
- Token refresh mechanism
- Password reset workflow

### Staff Invitation Flow
- Token-based invitation system
- 7-day expiry with resend capability
- Public acceptance endpoint
- Automatic user + staff creation

### Leave Management Features
- **Pending Request Tracking:** Balance calculation subtracts pending days
- **Transaction-Based Approval:** Atomic updates (request + allocation + notification)
- **File Attachments:** Upload, download, delete with validation
- **Balance Calculation:** `remaining = allocated - used - pending`
- **Notifications:** Sent on submission, approval, rejection

---

## 📝 Request/Response Format

### Standard Response Structure

**Success (2xx):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "message": "Error description"
}
```

### Pagination Format

```json
{
  "success": true,
  "data": {
    "items": [...]
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

---

## 🔧 Post-Request Scripts

### Login Request
Automatically saves tokens:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set('access_token', jsonData.data.token);
    if (jsonData.data.refreshToken) {
        pm.environment.set('refresh_token', jsonData.data.refreshToken);
    }
}
```

### Create Invitation
Saves invitation ID:
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set('invitation_id', jsonData.data.id);
}
```

---

## 🧪 Testing Checklist

### Before Testing
- [ ] Server running on `http://localhost:3000`
- [ ] Database seeded (`pnpm seed`)
- [ ] Environment imported and selected
- [ ] Login successful (token saved)

### Authentication Module
- [ ] Login with admin credentials
- [ ] Token saved to environment
- [ ] Get current user works
- [ ] Create new user works
- [ ] Role management works

### Staff Module
- [ ] Send invitation works
- [ ] Invitation appears in pending list
- [ ] Accept invitation (public) works
- [ ] New user can login
- [ ] Staff record created

### Leave Module
- [ ] Get leave balance shows correct data
- [ ] Submit leave request works
- [ ] File upload works (if tested)
- [ ] Approve request deducts days
- [ ] Balance updates after approval
- [ ] Reject request sends notification
- [ ] Pending requests block over-requesting

---

## 📞 Usage Instructions

### Import Collections

1. Open Postman
2. Click "Import" button
3. Select all `.json` files from `postman/` folder
4. Verify collections appear in sidebar

### Configure Environment

1. Click environment dropdown (top right)
2. Select "HR Management System - Environment"
3. Click "Eye" icon to view/edit
4. Verify `base_url` is `http://localhost:3000`
5. Verify credentials are correct

### Run Collections

1. Expand collection in sidebar
2. Click on request
3. Click "Send" button
4. View response in bottom panel
5. Check "Tests" tab for test results

### Use Collection Runner

1. Click "Runner" in Postman
2. Select collection to run
3. Select environment
4. Click "Run"
5. View results for all requests

---

## 🎓 Best Practices

### 1. Always Start with Login
Run the Login request first to get fresh token.

### 2. Use Environment Variables
Don't hardcode IDs. Use `{{user_id}}`, `{{leave_request_id}}`, etc.

### 3. Check Response Tests
Many requests have automated tests. Check "Test Results" tab.

### 4. Follow Logical Order
Create resources before updating/deleting them.

### 5. Save Important IDs
After creating resources, save IDs to environment.

---

## 🚀 Next Steps

### Collections to Add (Future)

- [ ] 04 - Attendance Management
- [ ] 05 - Payroll Management
- [ ] 06 - Performance & Appraisals
- [ ] 07 - Recruitment
- [ ] 08 - Notifications
- [ ] 09 - Branches & Departments
- [ ] 10 - Reporting & Analytics

### Enhancements

- [ ] Add pre-request scripts for dynamic data
- [ ] Add more example responses
- [ ] Create integration test workflows
- [ ] Add performance tests
- [ ] Create monitoring collections

---

## 📚 Related Documentation

- **API Documentation:** `docs/LEAVE_MODULE_API_DOCUMENTATION.md`
- **File Upload Guide:** `docs/LEAVE_REQUEST_FILE_UPLOAD_GUIDE.md`
- **Development Guidelines:** `.qwen/GUIDELINES.md`
- **Setup Checklist:** `.qwen/SETUP_CHECKLIST.md`

---

**Collections Created:** February 26, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
