# Tripa HR Management System - Professional Setup Guide

## Overview
This document describes the professional setup process for the Tripa HR Management System with three distinct phases: Day Zero Initialization, Building the Skeleton, and Staff Invitation Engine.

## Phase 1: Day Zero Initialization

### The "Activation Lock" Mechanism
- The system starts with an empty database
- Backend checks if the `users` table is empty
- If empty, the `/api/system/initialize` endpoint is enabled
- Once the first user is created, this endpoint is permanently disabled

### Super Admin Registration
- Owner registers using their personal/professional email (e.g., ceo@gmail.com)
- No cPanel involvement for Super Admin (prevents lockout if mail server issues occur)
- Owner provides their own password, making them the "Root" of the system
- System automatically creates "Super Admin" Role with wildcard (*) permission string
- Super Admin receives a welcome email to their personal email

### API Endpoints
- `GET /api/system/status` - Check if system is initialized
- `POST /api/system/initialize` - Initialize system with Super Admin (available only when system is uninitialized)

## Phase 2: Building the "Skeleton"

### Role & Permission Builder
- Super Admin accesses the UI to create roles (e.g., "Branch Manager," "Sales Rep")
- Select permissions from a hardcoded list (e.g., invite_staff, view_kpi, approve_tasks)
- All available permissions are defined in `src/services/permission-definitions.service.ts`

### Branch Management
- Super Admin adds company branches (e.g., "Lagos Branch," "Abuja Branch")
- Managed through the standard branch management UI/API

### Department Setup
- Super Admin defines internal structure where staff will be placed
- Managed through the standard department management UI/API

## Phase 3: Staff Invitation Engine

### The Invitation Process
1. Admin fills out staff member's personal details in the UI
2. Assigns them a Role and Branch created in Phase 2
3. Backend contacts cPanel API (bhs108b.superfasthost.cloud) to generate professional mailbox: firstname.lastname@tripa.com.ng
4. Backend uses Resend to send welcome email to staff member's personal email
5. Email contains new @tripa.com.ng login and temporary password
6. Staff member logs in, system recognizes is_temporary flag and forces password change
7. Staff member gains access to KPI Dashboard after setting permanent password

### API Endpoints
- `POST /api/staff-invitation` - Invite new staff member (requires staff:create permission)
- `GET /api/staff-invitation/roles` - Get available roles
- `GET /api/staff-invitation/branches` - Get available branches
- `GET /api/staff-invitation/departments` - Get available departments

## Technical Implementation Details

### Environment Variables Required
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=hr_management_system

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=onboarding@tripa.com.ng

# cPanel Configuration
CPANEL_HOST=bhs108b.superfasthost.cloud
CPANEL_USERNAME=your_cpanel_username
CPANEL_PASSWORD=your_cpanel_password
```

### Available Permissions
The system includes a comprehensive list of permissions organized by category:

#### Staff Management
- `staff:create` - Create new staff members
- `staff:read` - View staff information
- `staff:update` - Update staff information
- `staff:delete` - Delete staff members

#### User Management
- `users:create` - Create new user accounts
- `users:read` - View user information
- `users:update` - Update user information
- `users:delete` - Delete user accounts

#### Role Management
- `roles:create` - Create new roles
- `roles:read` - View roles
- `roles:update` - Update roles
- `roles:delete` - Delete roles

#### And many more permissions across different categories...

### Role Management API
- `GET /api/role-management` - Get all roles
- `GET /api/role-management/permissions` - Get all available permissions
- `POST /api/role-management` - Create new role (requires roles:create)
- `PUT /api/role-management/:id` - Update role (requires roles:update)
- `DELETE /api/role-management/:id` - Delete role (requires roles:delete)

## Security Features

### Password Policies
- Minimum 8 characters for all passwords
- Forced password change on first login for invited staff
- Bcrypt hashing for password storage

### Access Control
- JWT-based authentication
- Role-based permissions
- Activation lock prevents unauthorized system initialization
- Super Admin has wildcard permissions (*)

### Data Protection
- Rate limiting on all endpoints
- CORS protection
- Helmet security headers
- Input validation on all endpoints

## Setup Process

### Step 1: Database Preparation
1. Create a fresh database
2. Set up environment variables
3. Run database migrations if needed

### Step 2: System Initialization
1. Call `POST /api/system/initialize` with Super Admin details
2. Receive welcome email to personal email
3. Log in with provided credentials

### Step 3: Build Organizational Structure
1. Create roles using the role management API/UI
2. Set up branches and departments
3. Configure system settings

### Step 4: Invite Staff
1. Use staff invitation API/UI to add team members
2. System creates professional email accounts
3. Staff receive invitation emails with temporary passwords
4. Staff set permanent passwords on first login

## Benefits of This Approach

### Sustainability
- No ghost accounts or default credentials left in the system
- Clean, audit-ready user management

### Scalability
- Any business can set up the system themselves
- No developer intervention required after initial deployment

### Cleanliness
- Every staff member gets a "Work Identity" controlled by the company
- Super Admin remains as a safe, external "Master Key"

### Control
- Admin decides exactly what each role can/cannot do
- Granular permission management
- Complete organizational control

## Error Handling

### Common Issues
- cPanel API failure: Staff invitation will fail gracefully with appropriate error message
- Email service failure: System continues but logs the error
- Database connection issues: All endpoints return appropriate error responses

### Recovery Procedures
- Super Admin account cannot be deleted to prevent lockout
- Password reset functionality available for all users
- Audit trail maintained for all critical operations

## Support and Maintenance

### Monitoring
- All API calls are logged
- Failed authentication attempts are tracked
- System health check endpoint available

### Updates
- Permission definitions are centralized and easily extensible
- Role management API allows dynamic permission changes
- Email templates are configurable

---

This professional setup approach ensures a secure, scalable, and maintainable HR management system that grows with your organization's needs.