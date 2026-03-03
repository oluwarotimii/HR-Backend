# HR MANAGEMENT SYSTEM - COMPREHENSIVE BACKEND ARCHITECTURE
## Built for 200+ Employees, Multi-Branch Operations, High-Speed Performance & Complete Flexibility

---

## 1. SYSTEM OVERVIEW & CORE PRINCIPLES

### 1.1 Architecture Vision
The HR Management System is built as a **unified, dynamically-configurable backend API** serving an **HR Admin Dashboard** web interface. The system prioritizes:

- **Complete Dynamism:** Zero hardcoded business rules. Every policy (late thresholds, shift patterns, penalties, workflows) is configurable via the admin dashboard and can be changed in real-time.
- **Multi-Branch Isolation:** All data is scoped by `branch_id` at the database level. Each branch operates independently with its own rules, holidays, and configurations.
- **Role-Based Access Control (RBAC):** A sophisticated permission system where UI elements (menus, buttons, forms, fields) are invisible unless the user has explicit permission.
- **Immutable Audit Trail:** Every critical action (salary changes, permission modifications, staff terminations) is logged and cannot be deleted or edited.

### 1.2 Core Technology Stack
- **Backend Framework:** Next.js 14 (App Router) or Express.js + Node.js
- **Database:** MySQL (can use Prisma ORM or raw SQL migrations) for relational integrity; cPanel-hosted MySQL is supported for initial deployments
- **Authentication:** JWT tokens with refresh token rotation
- **Background Jobs:** Bull (job queue) or a DB-driven queue for environments without Redis (Bull + Redis recommended when available)
- **Real-Time Updates:** Optional WebSockets for dashboard live feeds or polling-based updates
- **File Storage:** Initially use cPanel storage (private folder outside public_html) for documents; recommend migrating to S3/Supabase Storage as scale grows

### 1.3 Key Entities & Data Isolation
```
- Company (single company per deployment)
  └── Branch (multiple locations, each with isolated data)
      ├── Staff (employees assigned to this branch)
      ├── Departments (organizational units within branch)
      ├── Shifts (work schedules defined per branch)
      ├── Attendance Records (scoped to branch staff)
      ├── Leave Requests (branch-specific leave policies)
      ├── Payroll Records (salary runs per branch)
      ├── KPI Assessments (performance reviews per branch)
      └── Branch Configuration (late thresholds, work hours, holidays)
```

**Note on generated artifacts:** During initial drafting I generated `schema.sql` and an example `email_service_resend.js`. Per your request those files were removed from the workspace; their essential design decisions (MySQL table list for the schema and the email logging/delivery approach) are preserved in this document.

---

## 2. FEATURE MODULES (DETAILED)

### 2.1 WORKFORCE & BRANCH MANAGEMENT

#### 2.1.1 Branch Configuration
**Purpose:** Define unique operational parameters for each branch.

**Key Features:**
- **Work Hours:** Set standard work hours (e.g., 8:00 AM - 5:00 PM) that can vary by branch.
- **Late/Early Thresholds:** Define grace periods dynamically.
  - Example: "Mark as late if clocked in after 8:30 AM"
  - Can be set per branch, per department, or per staff member (hierarchical override).
- **Geofencing Coordinates:** Set GPS boundaries for physical attendance verification.
- **Public Holidays:** Define branch-specific holidays (national, regional, company-specific).
- **Shift Patterns:** Define available shift templates (Day Shift, Night Shift, Flexible, etc.).

**Dynamic Configurability:**
- All parameters stored in a `BranchConfig` table, updateable via API.
- Changes take effect immediately (no redeployment).
- Audit log tracks all configuration changes with timestamps and user attribution.

**Global Work Hours & Branch Overrides:**
- The system supports a single global/default `resumption` and `closing` time (company-wide standard). Branches may optionally override these defaults with branch-specific resumption/closing times.
- Individual staff can also have their own work-hours (see `staff_work_hours`) which override both global and branch settings when present.
- Holiday definitions likewise have three levels: Global holidays → Branch-specific holidays → Individual staff holidays (individual entries take precedence when present).
- This layered approach allows administrators to set sensible defaults and selectively customise at branch or staff level without code changes.

#### 2.1.2 Staff Lifecycle Management
**Purpose:** Manage employees from onboarding through termination.

**Onboarding:**
- Create staff profile with personal details, emergency contacts, bank information.
- Assign to branch, department, and role.
- Set employment type (Full-time, Part-time, Contract, Temporary).
- Generate onboarding checklist (document requirements, training modules).
- Track onboarding progress with completion dates.

**Active Management:**
- View complete staff directory with filters (branch, department, status, role).
- Edit staff details (salary, role, department reassignments).
- Track job history and role transitions with audit trail.
- Manage emergency contacts and personal documentation.

**Termination:**
- Mark staff as "Terminated" (soft delete, retains historical data).
- Generate final payslip and clearance checklist.
- Archive documents and close access immediately.
- Retain all historical records for audit and compliance.

**Dynamic Extensibility:**
- Custom fields can be added to staff profile without code changes (e.g., "Badge ID", "Biometric ID").
- Onboarding checklists are template-based and configurable.

#### 2.1.3 Departmentalization & Reporting Structure
**Purpose:** Organize staff hierarchically with approval workflows.

**Structure:**
- Create nested departments (e.g., Marketing → Digital Marketing → Social Media).
- Assign department heads and sub-heads.
- Support matrix reporting (staff can report to multiple heads in different contexts).

**Workflow Benefits:**
- Leave requests route to direct manager first, then HR.
- KPI reviews follow hierarchy (self → manager → HR).
- Performance approvals respect reporting structure.

**Dynamic Features:**
- Restructure departments at runtime without data loss.
- Reassign heads with automatic workflow routing updates.

#### 2.1.4 Document Vault & Compliance
**Purpose:** Centralized secure storage of employee documents.

**Document Types:**
- National ID / Passport
- Employment Contract
- Certifications & Licenses
- Medical Records
- Insurance Documents
- Training Certificates
- Performance Reviews (archived)

**Features:**
- Upload documents with versioning (track document history).
- Set expiry dates with automatic alerts (30, 14, 7 days before expiry).
- Access control (only HR and respective staff can view their documents).
- Download & archive options.
- Auto-generate compliance reports (e.g., "Staff with expired certifications").

**Dynamic Rules:**
- Document requirements per role or branch are configurable.
- Expiry alert thresholds can be customized.

---

### 2.2 DYNAMIC ATTENDANCE & TIME TRACKING

#### 2.2.1 Clock-In/Clock-Out System
**Purpose:** Track staff presence with GPS verification for field staff.

**Core Flow:**
1. Staff clock-in via web dashboard or manual entry by manager.
2. System captures: timestamp, IP address, GPS coordinates (if applicable).
3. GPS validation: Check if coordinates are within branch geofence. Flag if outside.
4. Auto-calculate lateness based on configured late threshold for that staff/branch/day.
5. Generate attendance record.

**Features:**
- **Manual Adjustments:** HR can manually adjust clock-in times for technical failures with audit reason.
- **GPS Geofencing:** Optional GPS verification; can be disabled for remote/office staff.
- **Multiple Check-ins:** Support multiple clock-in/out pairs in a single day (e.g., for lunch break).
- **Corrective Requests:** Staff can request corrections to attendance with HR approval.

**Real-Time Notifications:**
- Alert HR if staff clocked in late.
- Notify staff of pending corrections.
- Dashboard shows real-time attendance status.

#### 2.2.2 Dynamic Late/Early Logic
**Purpose:** Flexibly categorize attendance with configurable thresholds.

**Mechanism:**
- Define business rules per branch (or override per staff):
  - "If clocked-in after 08:30, mark as LATE (1-30 min late)."
  - "If clocked-in after 09:00, mark as VERY_LATE (>30 min late)."
  - "If clocked-in after 10:00, mark as ABSENT."
  - "If clocked-out before 17:00, mark as EARLY_CLOSE (<30 min)."
  - "If clocked-out before 16:30, mark as VERY_EARLY (<60 min)."

**Configurability:**
- Rules stored as **Late/Early Policies** in the database, updateable without code changes.
- Support per-branch, per-department, per-staff overrides.
- Historical policies (support retroactive changes with audit trail).

**Auto-Calculation:**
- Nightly cron job calculates late/early flags for all attendance records.
- Stores in a denormalized `AttendanceSummary` table for instant dashboard loading.
- HR sees pre-calculated flags without query overhead.

**Penalties & Bonuses:**
- Link late categories to automatic salary deductions (configurable per branch).
  - Example: "1 LATE = -50 currency units."
- Track penalties in payroll for transparency.

#### 2.2.3 Off-Day & Shift Management
**Purpose:** Define work schedules with flexibility.

**Off-Days:**
- **Fixed Off-Days:** Recurring days off for a staff member (e.g., Sundays & Mondays).
- **Rotational Off-Days:** Rotating off-day schedule (e.g., different off-day each week).
- **Ad-Hoc Off-Days:** Temporary one-off off-days (e.g., due to leave or special assignment).
- Prevent attendance marking on off-days; flag if staff clocked in on off-day.

**Shift Management:**
- Define shift templates with start/end times (e.g., Morning Shift: 06:00-14:00, Evening Shift: 14:00-22:00).
- Assign shifts to staff (fixed or rotating).
- Support flexible shifts (staff can choose shift within a range, subject to approval).
- Track shift assignments over time for historical reporting.

**Shift Swaps & Overrides:**
- Staff request shift swaps; manager approves.
- HR can force-assign shifts with audit trail.
- System tracks all shift changes for payroll and compliance.

#### 2.2.4 Attendance History & Analytics
**Purpose:** Complete audit trail of attendance data.

**Tracking:**
- Store all clock-in/out events with timestamps, GPS, IP, user agent.
- Maintain `AttendanceSummary` for quick access to daily/weekly/monthly stats.
- Calculate metrics:
  - Present Days
  - Absent Days
  - Late Count & Total Late Minutes
  - Early Count & Total Early Minutes
  - On-Time Percentage
  - Punctuality Score

**Reporting:**
- Generate attendance reports by staff, department, branch, date range.
- Export to Excel/PDF for compliance and payroll integration.
- Real-time dashboard showing today's attendance status.

---

### 2.3 PERFORMANCE & APPRAISAL (KPI ENGINE)

#### 2.3.1 KPI Library & Creation
**Purpose:** Build a reusable library of measurable performance indicators.

**KPI Types:**
- **Quantitative:** Numeric metrics (e.g., "Sales Revenue", "Calls Handled", "Tasks Completed").
- **Qualitative:** Rating scales (e.g., "Customer Service Quality" on 1-5 scale).
- **Behavioral:** Competency-based (e.g., "Teamwork", "Communication", "Leadership").

**KPI Definition:**
- Name & Description
- Measurement Unit (currency, count, percentage, scale 1-5, etc.)
- Target Value (e.g., 100K sales, 50 calls/day)
- Weightage (importance in overall score, e.g., 30%)
- Calculation Method (automatic, manual, formula-based)
- Frequency (daily, weekly, monthly, quarterly, annual)

**Dynamic Extensibility:**
- Create KPIs via admin dashboard without code changes.
- Version KPIs (support retroactive changes with audit trail).
- Clone existing KPIs to create variants quickly.

#### 2.3.2 KPI Assignment & Tracking
**Purpose:** Assign KPIs to staff and track progress.

**Assignment Levels:**
- **Individual:** Assign specific KPIs to a staff member.
- **Departmental:** Assign KPIs to all staff in a department.
- **Role-Based:** Assign KPIs to all staff with a specific role.
- **Branch-Wide:** Apply KPIs to all staff in a branch.

**Tracking:**
- Manual entry (HR/Manager updates performance data).
- Auto-calculation (system pulls data from other modules, e.g., sales from CRM).
- Real-time dashboards showing KPI progress against targets.
- Alert when KPI falls below threshold.

**Period Management:**
- Support overlapping KPI cycles (e.g., Q1, Annual, Project-Based).
- Track KPI history for trend analysis.
- Compare staff performance across cycles.

#### 2.3.3 Appraisal Cycles & Multi-Level Reviews
**Purpose:** Structured, multi-stakeholder performance evaluation.

**Appraisal Cycle:**
1. **Planning Phase:** Define cycle period, participating staff, evaluation criteria.
2. **Self-Assessment:** Staff rates themselves against KPIs with comments.
3. **Manager Review:** Direct manager reviews staff performance, rates KPIs, provides feedback.
4. **HR Review:** HR conducts final review, approves/modifies ratings, adds comments.
5. **Finalization:** Appraisal is locked; cannot be edited (audit trail preserved).

**Scoring & Weighting:**
- Individual KPI scores: Manager rates each KPI (1-5, numeric, or percentage).
- Weighted calculation: Overall Score = Σ(KPI_Score × KPI_Weightage).
- Support custom scoring formulas (e.g., weighted averages, thresholds).

**Workflows:**
- Automatic notifications at each stage (staff submit, manager reviews, HR approves).
- Escalation if review delayed beyond deadline.
- Support for review reminders and deadline extensions.

**Output:**
- Final appraisal report with ratings, comments, recommendations.
- Generate development plans (training, promotion, improvement areas).
- Export for HR records and compensation planning.

**Dynamic Configurability:**
- Define appraisal cycle templates (recurring vs. one-time).
- Customize review stages and stakeholders per cycle.
- Configure rating scales and scoring formulas per cycle.

### 2.3.4 KPI Calculation Engine (Design Overview)

**Purpose:** Provide a flexible, auditable calculation engine that computes KPI values and appraisal scores from configurable data sources, formulas, and schedules.

**Key Capabilities:**
- **Formula Definitions:** Admins define formulas using a safe expression language (examples: `sum(sales,30d)`, `avg(calls,period)`, `if(value>target,100, value/target*100)`).
- **Data Sources:** Formulas can reference internal modules (attendance, payroll, CRM exports) or external webhooks/ETL sources.
- **Weighting & Aggregation:** Combine KPI metrics into composite scores using admin-set weightages and aggregation functions.
- **Scheduling:** Run on-demand or scheduled (daily/weekly/monthly) with pre-calculation stored in `kpi_metrics` and `kpi_aggregates` for fast dashboard rendering.
- **Simulation & Preview:** Admins can simulate a calculation for a staff or department before committing it to be used in appraisals.
- **Auditability:** Store formula versions, inputs, intermediate values, and final outputs so every appraisal score can be traced back to source data.

**Implementation Notes (plan-level):**
- Store `kpi_formulas` with a safe evaluator (e.g., expression evaluator library with a whitelist of functions).
- Build a scheduler that resolves formula dependencies and computes metrics in topological order.
- Persist `kpi_metrics` (raw metrics) and `kpi_aggregates` (weighted scores) for each staff and cycle.
- Provide APIs to fetch computed KPI results and to trigger recalculation for a given cycle.

---

### 2.3.5 Multi-Source Performance Intelligence Engine

**Purpose:** Transform the KPI system into a comprehensive Performance Intelligence Engine that integrates data from multiple sources (System, HR, Staff) and processes them through dynamic mathematical formulas to generate calculated performance snapshots.

**Core Architecture:**

#### Data Intake Layer (The Sources)
The system treats data entry as a stream of events categorized into three streams:

1. **The Automated Stream (System):** Data pulled directly from other modules
   - Attendance module: days present, punctuality metrics
   - Sales module: revenue figures, deal closures
   - PC Clinic module: repair counts, equipment maintenance
   - Logistics module: trip distances, delivery efficiency

2. **The Subjective Stream (HR/Managers):** Data entered by supervisors
   - Leadership quality assessments
   - Compliance ratings
   - Behavioral evaluations

3. **The Self-Reported Stream (Staff):** Staff-entered data requiring verification
   - Daily activity reports ("5 repairs completed")
   - Trip logs ("200km driven")
   - Project completion claims

#### KPI Definition System (The Metric Metadata)
Each KPI becomes a data instruction with enhanced metadata:
- Identity: Name and description
- Owner: Who provides this data? (Staff, HR, System)
- Frequency: Daily, weekly, monthly, quarterly
- Target: Success benchmarks
- Department/Role Association: KPIs tied to specific roles (Technicians, Sales, Engineers, Teachers, Logistics)

#### Appraisal Template Engine (The Strategic Recipe)
The template serves as the "brain" of the operation:
- Ingredients: Specific KPIs for each role
- Weighting: Role-specific importance (e.g., "Repair Quality" 60% for Technician, "Punctuality" 10%)
- Logic Formula: Mathematical expressions (e.g., (A * 0.6) + (B * 0.4))

#### Assignment & Mapping Engine
Links employees to appropriate templates:
- Maps employees to role-specific appraisal templates
- Tracks performance cycles (January 1st to March 31st)
- Supports multi-faceted organization with different mathematical rules per department

#### Calculation Worker (The Processor)
Background process acting as "Virtual Accountant":
- Identifies active staff and assigned templates
- Hunts for required KPI values across all data streams
- Applies dynamic formulas to generate performance scores
- Outputs Final Performance Profiles

#### Insight & Analytics Layer
Generates comprehensive data breakdowns:
- Compares Self-Reported vs HR-Entered vs System data
- Flags discrepancies ("High Quantity, Low Quality — Training Needed")
- Creates Performance Heatmaps across departments
- Provides comparative analysis and trend identification

**Department-Specific Modules:**

1. **PC Clinic Module:**
   - Technician KPIs for repair efficiency and quality
   - Self-reporting forms for daily activities
   - Performance calculation based on quantity and quality metrics

2. **Logistics Module:**
   - Trip-based performance tracking
   - Distance, efficiency, and delivery metrics
   - Driver performance evaluation

3. **Sales Module:**
   - Revenue-based performance metrics
   - Deal closure rates and customer satisfaction
   - Commission and bonus calculations

4. **Teaching Module:**
   - Educational performance indicators
   - Student feedback integration
   - Curriculum delivery metrics

**Formula Builder Capability:**
- Admins can create custom appraisal formulas through UI
- Support for complex mathematical expressions
- Conditional logic (IF statements, thresholds)
- Real-time formula testing and validation

**Automatic Email Notifications:**
- Domain-specific email templates
- Performance-based notifications
- Automated alerts for low performance or discrepancies
- Scheduled performance review reminders

**Implementation Notes (plan-level):**
- Create `performance_data_stream` table to handle multi-source data ingestion
- Enhance `kpi_definitions` table with department/role associations and data source types
- Build `appraisal_templates` table with formula definitions and weight distributions
- Develop `employee_template_assignments` for linking staff to appropriate templates
- Create `performance_calculations` table for storing calculated results
- Implement background worker for performance intelligence processing
- Build comparative analysis engine for discrepancy detection
- Develop department-specific KPI modules with role-based access

---

### 2.4 LEAVE & TIME-OFF MANAGEMENT

#### 2.4.1 Leave Policy Configuration
**Purpose:** Define flexible leave policies per branch.

**Leave Types:**
- Annual Leave / PTO (Paid Time Off)
- Sick Leave
- Casual Leave
- Bereavement Leave
- Maternity/Paternity Leave
- Unpaid Leave
- Sabbatical

**Policy Parameters (per leave type, per branch):**
- Entitlement per year (e.g., 21 days annual leave).
- Carryover rules (can unused days be carried to next year?).
- Carryover limit (max days that can be carried forward).
- Encashment rules (can unused leave be paid out?).
- Notice period required (e.g., 5 days advance notice for annual leave).
- Approval workflow (direct manager, then HR, or parallel).
- Blackout dates (when leave cannot be taken, e.g., year-end).
- Gender-based entitlements (e.g., maternity vs. paternity leave differences).

**Dynamic Updates:**
- Change leave policies at runtime; changes apply to new leave requests only (historical data immutable).

### Dynamic Leave Expiry & Automated Notifications

**Requirement:** Some leave types expire after a configurable period from activation (or other reference points). Administrators must be able to create leave types with custom expiry rules, set notification schedules, and automate alerts when leave balances are near expiry or have expired.

**Key capabilities:**
- **Configurable Expiry Rules:** For each `LeaveType` administrators can set:
  - `expiry_mode`: `FROM_ACTIVATION`, `ANNUAL_RESET`, `FIXED_DATE`, or `ROLLING_PERIOD`.
  - `expiry_value`: integer number of days (e.g., 30 days) or a fixed date pattern.
  - `accrual_unit` and `accrual_amount` (e.g., 7 days every 6 months).
  - `auto_forfeit`: boolean (if true, unused leave expires automatically when past expiry).

- **Examples:**
  - *Salah Leave* — `expiry_mode=FROM_ACTIVATION`, `expiry_value=30` → every allocation lasts 30 days from activation.
  - *General Leave* — `expiry_mode=ANNUAL_RESET`, `expiry_value=0` → entitlement resets each calendar year.
  - *Short-Accrual Leave* — accrual 7 days every 6 months, `accrual_unit=MONTHS`, `accrual_amount=6`, `accrual_days=7`.

- **Per-User Activation Records:** Each time leave is granted or allocated, create a `leave_allocation` record with `allocated_at`, `amount`, and `expiry_date` (computed from `LeaveType` rules). Notifications and expiries operate against these allocation records rather than aggregated balances to preserve traceability.

- **Notification Scheduling:** Admins can configure notification triggers per `LeaveType` such as:
  - Send X days before expiry (e.g., 30, 14, 7, 1 days).
  - Send on expiry date.
  - Send periodically if balance remains unused after expiry.

- **Notification Channels & Content:**
  - Channels supported: **Email** (Resend), **In-app** notifications, **Webhooks** (for integrations), **SMS** (optional via provider).
  - Notification templates stored as editable templates with placeholders (e.g., {{name}}, {{leave_type}}, {{expiry_date}}, {{balance}}).

- **Automated Actions:** When an allocation expires and `auto_forfeit=true`, the system:
  1. Marks the allocation as `expired`.
  2. Deducts/adjusts the aggregated `leave_balance` accordingly.
  3. Creates an audit log entry of the expiry action.
  4. Triggers configured notifications (email + in-app).

- **Admin UI Controls:**
  - Create/Edit `LeaveType` including expiry rules and notification schedule.
  - View list of upcoming expiries across staff with filters (branch, department, leave type, date range).
  - Manually trigger a notification or bulk-notify selected staff.

**Implementation notes (plan-level):**
- Add `leave_types.expiry_mode`, `leave_types.expiry_value`, `leave_types.auto_forfeit`, and `leave_types.notification_config` (JSON) to the DB model.
- Add `leave_allocations` table: `id, staff_id, leave_type_id, amount, allocated_at, expiry_date, status`.
- Scheduled job (daily) scans `leave_allocations` for upcoming expiries and enqueues notification jobs; another job handles expiry processing for `auto_forfeit` allocations.
- Log all notification sends in `email_logs` / `notification_logs` for deliverability troubleshooting.

This design keeps leave expiry behavior dynamic and configurable while preserving precise accounting of allocations for compliance and reporting.

#### 2.4.2 Leave Workflow & Approvals
**Purpose:** Streamlined request and approval process.

**Request Flow:**
1. Staff submits leave request (date range, leave type, reason, attachments if sick leave).
2. System validates:
   - Leave balance available.
   - Notice period met.
   - Not during blackout dates.
   - Minimum staffing levels (optional: prevent >3 staff on same leave in a department).
3. Request routed to manager for approval.
4. If approved by manager, routes to HR for final approval.
5. If rejected, staff notified with rejection reason.
6. If approved, auto-calculate and deduct leave balance.

**Tracking:**
- Leave balance per staff per leave type, updated in real-time.
- Historical log of all leave taken with dates and approval chain.

**Extensions & Adjustments:**
- Staff can request leave extension before leave ends.
- HR can adjust leave dates retroactively with audit reason (e.g., correcting system error).

**Leaves in Transit:**
- Track on-the-day leave requests (e.g., emergency leave, same-day approval by manager).

#### 2.4.3 Leave Analytics & Compliance
**Purpose:** Monitor leave patterns and ensure policy compliance.

**Reports:**
- Leave balance sheet per staff, department, branch.
- Leave usage trends (which staff take most leave, by type).
- Compliance alerts (staff approaching max carryover, employees taking excessive sick leave).
- Forfeiture tracking (leave expiring/forfeited at year-end).

**Dashboards:**
- Real-time leave calendar showing who's on leave each day.
- Department leave coverage (identifying dates with high absence).

---

### 2.5 PAYROLL & COMPENSATION

#### 2.5.1 Salary Structure Definition
**Purpose:** Flexible, configurable salary components.

**Components:**
- **Basic Salary:** Fixed monthly amount.
- **Allowances:** Fixed or variable (e.g., Transport Allowance 500/month, Commission 5% of sales).
- **Deductions:** Mandatory (tax, insurance) or discretionary (loans, advances).
- **Bonuses:** Performance-based (linked to KPIs) or discretionary.
- **Late Penalties:** Automatic deductions based on late/early logic.

**Salary Configuration:**
- Define salary structure per role or per staff member.
- Support multiple salary components with effective dates (support salary increments over time).
- Link bonuses to KPI performance automatically.
- Link penalties to attendance automatically.

#### 2.5.2 Payroll Calculation & Generation
**Purpose:** One-click, automated payroll processing.

**Calculation Process:**
1. Select payroll cycle (e.g., Jan 1-31, 2025).
2. System auto-fetches:
   - Attendance data (late penalties, early deductions).
   - KPI performance (bonuses).
   - Leave taken (pro-rata salary adjustment if applicable).
   - Existing deductions (loans, advances).
3. Calculate gross salary: Basic + Allowances + Bonuses - Penalties - Deductions.
4. Calculate taxes (if applicable, based on configurable tax rules).
5. Calculate net salary.
6. Generate payslips for all staff.

**Payslip Components:**
- Employee name, ID, branch, period.
- Detailed breakdown: Basic, Allowances, Gross, Deductions, Taxes, Net.
- Leave summary for the period.
- Attendance summary (late count, early count, on-time %).
- Performance bonus details (linked KPIs).
- Penalties breakdown.
- Signed by HR (digital signature or approval status).

**Approval & Finalization:**
- HR reviews calculated payroll, approves/rejects.
- Rejected payslips can be manually adjusted and resubmitted.
- Once approved, payslips are locked (cannot be edited, full audit trail).
- Generate bank transfer file for automated payment.

**Retroactive Adjustments:**
- Support payroll adjustments in subsequent months (e.g., recover overpayment from February if January had error).

**Dynamic Configurability:**
- Tax rules configurable (e.g., progressive tax brackets).
- Salary component formulas customizable (e.g., calculate bonus as 5% of sales).
- Late penalty rules linked to attendance configuration.

---

### 2.6 DYNAMIC FORM BUILDER (ADMIN-DEFINED FORMS)

**Purpose:** Allow admins to create arbitrary forms and input flows via the web UI so no input forms are hardcoded in the frontend. Business teams build application forms, onboarding checklists, surveys, and case forms directly in the admin panel.

**Key Features:**
- **Form Templates:** Admins create named form templates (title, description, access permissions, submission rules).
- **Fields:** Add fields of types: text, number, email, phone, date, time, select (single/multi), checkbox, file upload, rich text.
- **Validation & Rules:** Set required/optional, min/max, regex validation, and conditional visibility (show field B if field A == X).
- **Versioning:** Forms are versioned; edits create a new version so historical submissions map to the version used.
- **Permissions:** Control which roles/users/branches can view, submit, or manage forms via the permission manifest.
- **Workflows:** Hook submissions into approval workflows (auto-route to manager, HR, or custom approvers) and background jobs.
- **Data Storage:** Submissions stored as JSON with indexed meta fields for search; files stored in protected storage served via backend.
- **Exports & Integrations:** Export submissions to CSV/PDF and trigger webhooks or email notifications (e.g., via Resend).

**Admin UX:**
- Drag-and-drop builder in the admin dashboard to create form layouts.
- Preview and test mode before publishing.
- Ability to attach forms to staff profiles, job postings, onboarding flows, or public job application pages.

**Implementation Notes (plan-level):**
- Store `forms`, `form_fields`, `form_versions`, and `form_submissions` in the DB; keep `form_submissions` as JSON for flexible schemas.
- Provide an API to fetch form definitions and submit responses; UI renders based on the form definition.
- Integrate validation on both client and server for security and data integrity.


#### 2.5.3 Payroll History & Analytics
**Purpose:** Complete salary tracking and trend analysis.

**Tracking:**
- Store all payslips (immutable once finalized).
- Track salary changes over time with effective dates.
- Archive historical salary structures for reference.

**Reports:**
- Payroll summary (total salaries, bonuses, penalties, deductions per period).
- Staff-wise salary trends (salary growth over 12 months).
- Departmental payroll (by cost center or department).
- Compliance reports (tax withholding, statutory deductions).

**Staff Access:**
- Staff can view their own payslips and download as PDF.
- Limited staff view (gross salary, net salary, dates) without sensitive details.

---

## 3. PERMISSION & ACCESS CONTROL SYSTEM (ATOMIC RBAC)

### 3.1 Permission Model
**Purpose:** Fine-grained control over features, menus, and data.

**Permission Hierarchy:**
```
Permissions (leaf nodes, e.g., "attendance:view", "payroll:approve")
  ↓
Roles (collections of permissions, e.g., "HR Manager", "Department Head")
  ↓
Users (assigned one or more roles, e.g., User is "HR Manager" + "Report Viewer")
```

**Permission Examples:**
- `staff:view` - View staff directory
- `staff:create` - Create new staff
- `staff:edit` - Edit staff details
- `staff:delete` - Delete staff (terminate)
- `attendance:view` - View attendance records
- `attendance:adjust` - Manually adjust attendance
- `attendance:export` - Export attendance to Excel
- `leave:approve` - Approve leave requests
- `payroll:generate` - Generate payslips
- `payroll:approve` - Approve & finalize payroll
- `payroll:export` - Export payslips
- `kpi:create` - Create KPI definitions
- `kpi:assign` - Assign KPIs to staff
- `kpi:review` - Conduct KPI reviews
- `config:view` - View branch configuration
- `config:edit` - Modify branch configuration
- `audit:view` - View audit logs

**Data Filtering:**
- Use roles to filter data access:
  - `Department Head` can only see staff/attendance/leave in their department.
  - `Branch Manager` can only see data for their branch.
  - `Global HR Admin` can see all data.

### 3.2 Dynamic Role Assignment
**Purpose:** Assign and revoke roles in real-time.

**Role Management:**
- HR Admin creates roles with custom permission sets.
- Assign roles to users individually.
- Support role inheritance (e.g., "Senior Manager" inherits all permissions of "Manager" + additional).

**Audit Trail:**
- Log all role assignments and changes.
- Track when permissions were added/removed.
- Support retroactive audit queries (what permissions did user X have on date Y?).

### 3.3 Permission Manifest
**Purpose:** Frontend receives dynamic list of enabled features on login.

**Manifest Structure:**
```json
{
  "user": {
    "id": 123,
    "name": "John Doe",
    "role": "HR Manager",
    "branch_id": 1
  },
  "permissions": [
    "staff:view", "staff:create", "staff:edit",
    "attendance:view", "attendance:adjust",
    "leave:approve", "payroll:view",
    "config:view"
  ],
  "features": {
    "staff_management": { "enabled": true, "visible": true },
    "attendance": { "enabled": true, "visible": true },
    "leave_management": { "enabled": true, "visible": true },
    "payroll": { "enabled": false, "visible": false },
    "kpi_engine": { "enabled": false, "visible": false }
  },
  "ui_elements": {
    "create_staff_button": true,
    "approve_leave_button": true,
    "payroll_menu": false,
    "export_button": true
  }
}
```

**Frontend Usage:**
- Admin Dashboard receives manifest on login.
- Build menus/buttons dynamically based on manifest (invisible UI).
- Feature flags in manifest used to conditionally render components.

### 3.4 Recommended Permission Strategy

**Summary:** Use roles composed of permission strings as the primary assignment mechanism, and allow optional per-user permission overrides for exceptional cases. This gives the maintainability benefits of roles while preserving flexibility for one-off exceptions.

**Why this approach:**
- **Roles first:** Roles group permissions into meaningful job profiles (e.g., `HR Manager`, `Branch Admin`, `Payroll Clerk`). Assigning roles to users is simple and scales well as the organization grows.
- **Permission atoms:** Keep permissions as atomic strings (e.g., `attendance:adjust`, `payroll:approve`) so UI features and backend checks remain consistent.
- **User overrides:** Provide `user_permissions` to `allow` or `deny` specific permission atoms for individual users. Use `deny` to explicitly revoke a permission that would otherwise be inherited via role(s).

**Resolution order for permission checks:**
1. Check explicit `user_permissions` (deny/allow) — highest priority.
2. Aggregate permissions from assigned `roles`.
3. Default deny if permission not granted.

**Operational notes:**
- Provide an admin UI to simulate effective permissions for a user (show final computed permissions and source: role vs override).
- Cache effective permission sets in Redis and invalidate when roles or user overrides change.
- Log permission changes in the audit trail for traceability.


---

## 4. SYSTEM PERFORMANCE & OPTIMIZATION

### 4.1 Caching Strategy
**Purpose:** Fast permission checks and frequent data access.

**Redis Cache Layers:**
1. **Permission Cache:** User → Roles → Permissions (TTL: 1 hour, invalidated on role changes).
2. **Branch Configuration Cache:** Branch ID → Config rules (TTL: 1 hour, invalidated on config updates).
3. **Attendance Summary Cache:** Daily attendance stats (recalculated nightly).
4. **Staff Directory Cache:** Staff list with basic info (TTL: 30 mins, invalidated on staff changes).

**Cache Invalidation Strategy:**
- Explicit invalidation on data changes (e.g., staff role updated → clear user permission cache).
- TTL-based expiration for eventual consistency.
- Admin can manually flush caches if needed.

### 4.2 Background Job Processing
**Purpose:** Offload heavy tasks from synchronous API calls.

**Queue Tasks (using Bull/Agenda):**
1. **Nightly Calculations:**
   - Recalculate attendance summaries (late/early flags).
   - Update KPI progress from external data sources.
   - Calculate leave balances at period end.

2. **Payroll Generation:**
   - Generate payslips for 200+ staff in background.
   - Post notifications when payroll is ready.

3. **Report Generation:**
   - Generate compliance reports on demand.
   - Export large datasets to Excel/PDF.
   - Email reports to managers automatically.

4. **Scheduled Tasks:**
   - Send leave expiry alerts (30, 14, 7 days before expiry).
   - Send performance review reminders.
   - Cleanup old audit logs (retention: 7 years for compliance).

**Job Monitoring:**
- Dashboard shows queue status, active jobs, failed jobs.
- Retry failed jobs manually.
- Logs for job execution with timestamps.

### 4.3 Database Optimization
**Purpose:** Fast queries even with large datasets.

**Denormalization Strategy:**
- `AttendanceSummary` table: Pre-calculated daily stats (late count, early count, present/absent).
- `LeaveBalance` table: Current leave balance per staff per leave type (updated atomically).
- `PayrollSummary` table: Pre-calculated monthly salary totals per staff.

**Indexing:**
- Index on frequently filtered columns: `branch_id`, `staff_id`, `date`, `status`.
- Composite indexes for common queries: `(branch_id, date, status)`, `(staff_id, leave_type)`.

**Query Optimization:**
- Use pagination for large result sets (default: 20 records per page).
- Lazy-load relationships (e.g., fetch staff list first, then load department on demand).
- Avoid N+1 queries (batch fetch related data).

### 4.4 Real-Time Features (Optional)
**Purpose:** Live updates on admin dashboard.

**WebSocket Implementation (if needed):**
- Real-time attendance status (staff clocking in shows immediately on dashboard).
- Live payroll calculation progress (show %).
- Instant leave request notifications.

**Fallback (Polling):**
- If WebSockets not feasible, use 5-10 sec polling for non-critical features.
- Reserve real-time updates for critical features only (e.g., leave approvals).

---

## 5. AUDIT & COMPLIANCE

### 5.1 Immutable Audit Logging
**Purpose:** Complete accountability and regulatory compliance.

**Events Logged:**
- User login/logout (with IP, timestamp, device info).
- Staff lifecycle changes (creation, role changes, termination, data edits).
- Attendance adjustments (who adjusted, reason, old vs. new value).
- Leave approval/rejection (approver, timestamp, comments).
- Payroll changes (which components were modified, previous values).
- Permission changes (which permissions added/removed, by whom).
- Configuration changes (which setting was changed, old vs. new value).
- Data exports (who exported, what data, when).

**Audit Log Structure:**
```
{
  "id": UUID,
  "timestamp": "2025-01-14T10:30:00Z",
  "user_id": 123,
  "action": "staff:edit",
  "entity_type": "Staff",
  "entity_id": 456,
  "old_values": { "salary": 50000, "role": "Developer" },
  "new_values": { "salary": 55000, "role": "Senior Developer" },
  "reason": "Annual salary review",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "status": "success"
}
```

**Retention & Compliance:**
- Audit logs stored in immutable table (no DELETE operations).
- Retention: 7 years minimum (configurable).
- Regular backups for compliance audits.
- Search/filter audit logs by user, action, date range, entity.

### 5.2 Alerts & Notifications
**Purpose:** Flag sensitive operations for review.

**Alert Scenarios:**
- Staff salary changed by >10% (alert HR admin).
- Permission changed for user (alert security/compliance team).
- Staff terminated (alert to audit trail).
- Payroll approved (HR admin receives confirmation).
- Attendance corrected after 30 days (flag as potential issue).
- Leave balance goes negative (system error alert).

**Alert Delivery:**
- Email notifications to designated recipients.
- In-app notifications (dashboard alerts).
- Slack/Teams webhooks (if configured).

---

## 6. API ARCHITECTURE

### 6.1 RESTful Endpoints (Examples)
```
Authentication:
  POST /api/auth/login
  POST /api/auth/logout
  POST /api/auth/refresh-token
  GET  /api/auth/me

Staff Management:
  GET    /api/staff (list, with filters)
  GET    /api/staff/:id
  POST   /api/staff (create)
  PATCH  /api/staff/:id (update)
  DELETE /api/staff/:id (terminate)
  GET    /api/staff/:id/documents
  POST   /api/staff/:id/documents (upload)

Attendance:
  POST   /api/attendance/clock-in
  POST   /api/attendance/clock-out
  GET    /api/attendance (list records)
  PATCH  /api/attendance/:id (adjust manually)
  GET    /api/attendance/summary (daily/weekly/monthly)

Leave:
  POST   /api/leave-requests (submit request)
  GET    /api/leave-requests (list, with status filter)
  PATCH  /api/leave-requests/:id/approve
  PATCH  /api/leave-requests/:id/reject
  GET    /api/leave-balance/:staff_id

Payroll:
  POST   /api/payroll/generate (trigger payroll generation)
  GET    /api/payroll (list cycles)
  GET    /api/payroll/:cycle_id/payslips
  PATCH  /api/payroll/:cycle_id/approve
  GET    /api/payslips/:id (download PDF)

KPI:
  POST   /api/kpis (create KPI definition)
  GET    /api/kpis (list KPI definitions)
  POST   /api/kpi-assignments (assign KPI to staff)
  GET    /api/kpi-appraisals (list appraisals)
  POST   /api/kpi-appraisals (create appraisal cycle)
  PATCH  /api/kpi-appraisals/:id (submit review)

Configuration:
  GET    /api/config/branch/:branch_id
  PATCH  /api/config/branch/:branch_id (update)
  GET    /api/permissions (fetch permission manifest)
  GET    /api/audit-logs (view audit trail)

Reports:
  POST   /api/reports/generate (trigger report generation)
  GET    /api/reports/:id (download report)
```

### 6.2 Error Handling
- Standardized error responses with error codes and messages.
- Validation errors return detailed field-level errors.
- Auth errors return 401; permission errors return 403; not found returns 404.
- Server errors return 500 with opaque ID for debugging without exposing internals.

### 6.3 Rate Limiting & Security
- Rate limit API endpoints (e.g., 100 requests per minute per user).
- CORS configured for admin dashboard origin only.
- All sensitive endpoints require JWT token + permission check.
- Input validation on all endpoints (sanitize, validate data types).
- SQL injection prevention (use parameterized queries).
- CSRF protection for state-changing operations.

---

## 7. DATABASE SCHEMA OVERVIEW

Key tables:
```
+ - Users (id, email, password_hash, display_name, is_active, created_at, updated_at)
+ - Roles (id, name, description, created_at)
+ - Permissions (id, action, resource, description)
+ - RolePermissions (role_id, permission_id)
+ - UserRoles (user_id, role_id)
+ - UserPermissions (user_id, permission_id, grant_type) -- optional direct overrides
+ - Branches (id, name, location, geofence_json, created_at)
+ - Departments (id, name, head_id, parent_department_id, branch_id, created_at)
+ - Staff (id, user_id, staff_number, first_name, last_name, email, phone, salary, role_title, department_id, branch_id, employment_type, status, hired_date, terminated_date, meta, created_at, updated_at)
+ - StaffWorkHours (id, staff_id, weekday, start_time, end_time, timezone, effective_from, effective_to)
+ - StaffHolidays (id, staff_id, holiday_date, description)
+ - Attendance (id, staff_id, clock_in, clock_out, gps_lat, gps_lng, ip_address, is_late, is_early, status, raw_meta, created_at)
+ - AttendanceSummary (id, staff_id, date, present, late_minutes, early_minutes, created_at)
+ - LeaveTypes (id, name, description, created_at)
+ - LeaveRequests (id, staff_id, leave_type_id, start_date, end_date, days, reason, status, requested_by, approved_by, approved_at, created_at)
+ - LeaveBalances (id, staff_id, leave_type_id, year, entitlement, used, balance, updated_at)
+ - LatePolicy / EarlyPolicy (policy definitions stored per branch or globally)
+ - PayrollCycles (id, branch_id, cycle_start, cycle_end, status, created_at)
+ - Payslips (id, payroll_id, staff_id, basic, allowances, deductions, bonuses, penalties, gross, tax, net, created_at)
+ - KPIs (id, name, description, unit, target_value, weightage, frequency, calculation, created_at)
+ - KPIAssignments (id, kpi_id, staff_id, start_date, end_date)
+ - KPIAppraisals (id, staff_id, cycle_start, cycle_end, scores, final_score, status, created_at)
+ - Jobs (id, title, department_id, description, location, employment_type, is_published, posted_at, closed_at, created_by)
+ - JobApplications (id, job_id, applicant_name, applicant_email, cover_letter, resume_url, status, applied_at, reviewed_by, reviewed_at)
+ - Documents (id, staff_id, uploaded_by, filename, storage_path, storage_type, metadata, expiry_date, created_at)
+ - AuditLogs (id, timestamp, user_id, action, entity_type, entity_id, old_values, new_values, reason, ip_address, user_agent)
+ - EmailLogs (id, to_email, subject, template_id, provider, provider_message_id, status, response, created_at)
```

---

## 8. DEPLOYMENT & SCALABILITY

### 8.1 Infrastructure
- - **Server:** Node.js running on Docker containers (or cPanel Node.js App for small deployments) managed by PM2 for high availability on cPanel.
- - **Database:** MySQL (cPanel-hosted MySQL for initial deployments; managed MySQL or cloud MySQL for scale).
- - **Caching:** Redis (managed service for clustering) recommended; if unavailable, use DB-driven queues and caching fallback.
- - **Job Queue:** Bull with Redis backend or a DB-driven queue for environments without Redis.
- - **File Storage:** Start with cPanel private storage (outside public_html); recommend S3/Supabase Storage for production scaling.
- - **Monitoring:** CloudWatch, Datadog, or New Relic for performance tracking; for cPanel, use server monitoring tools available on the hosting plan.

### 8.2 Scalability Considerations
- Horizontal scaling: Multiple API instances behind load balancer.
- Database read replicas for reporting queries (don't impact transactional DB).
- CDN for static assets (images, PDFs if cached).
- Vertical scaling if needed (increase server specs).

### 8.3 Deployment Strategy
- CI/CD pipeline (GitHub Actions, GitLab CI) for automated testing and deployment.
- Blue-green deployment for zero-downtime updates.
- Feature flags for gradual rollout of new features.
- Rollback capability in case of issues.

---

## 9. IMPLEMENTATION ROADMAP

**Phase 1: Core Setup & Auth**
- Project initialization, database setup, authentication system.
- Timeline: 2 weeks.

**Phase 2: Staff Management & Attendance**
- Staff lifecycle, attendance tracking, late/early logic.
- Timeline: 3 weeks.

**Phase 3: Leave Management**
- Leave policies, request workflows, balance tracking.
- Timeline: 2 weeks.

**Phase 4: Payroll**
- Salary structure, payroll calculation, payslips.
- Timeline: 3 weeks.

**Phase 5: KPI & Appraisal Engine**
- KPI definitions, assignments, appraisal cycles.
- Timeline: 3 weeks.

**Phase 6: Audit & Compliance**
- Audit logging, permission manifest, alerts.
- Timeline: 2 weeks.

**Phase 7: Performance Optimization & Testing**
- Caching, query optimization, background jobs, testing.
- Timeline: 2 weeks.

**Phase 8: Deployment & Documentation**
- CI/CD setup, deployment, user documentation.
- Timeline: 1 week.

**Total: ~16 weeks (~4 months).**

---

## 10. SUCCESS METRICS

- **Performance:** Dashboard loads in <2 seconds, API response time <500ms at p95.
- **Reliability:** 99.9% uptime, <1 hour MTTR for critical issues.
- **Scalability:** Handle 200+ staff, 50+ concurrent users without degradation.
- **Accuracy:** Payroll calculated correctly 100% of the time, no data loss.
- **Compliance:** All audit logs captured, immutable, 7-year retention.
- **User Satisfaction:** Training time <30 mins, <1% error rate from users.

---

## 11. CORE DATABASE SCHEMA DETAILS

### 11.1 Dynamic Form & Form Submission Tables

**`forms` Table** — Stores form definitions (layout, fields, validation rules).
```sql
CREATE TABLE forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  form_type ENUM('leave_request', 'appraisal', 'application', 'feedback', 'custom') NOT NULL,
  branch_id INT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  INDEX (form_type, is_active)
);
```

**`form_fields` Table** — Individual fields within a form.
```sql
CREATE TABLE form_fields (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_id INT NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type ENUM('text', 'email', 'number', 'date', 'textarea', 'dropdown', 'checkbox', 'file', 'phone', 'address') NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  placeholder VARCHAR(255),
  help_text TEXT,
  validation_rule VARCHAR(500),
  options JSON,
  field_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  UNIQUE KEY (form_id, field_name),
  INDEX (field_order)
);
```

**`form_submissions` Table** — Submitted form data (one row per submission).
```sql
CREATE TABLE form_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_id INT NOT NULL,
  user_id INT NOT NULL,
  submission_data JSON NOT NULL,
  status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX (form_id, user_id, status),
  INDEX (submitted_at)
);
```

**`form_attachments` Table** — Uploaded files tied to form submissions.
```sql
CREATE TABLE form_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_submission_id INT NOT NULL,
  field_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES form_fields(id),
  INDEX (form_submission_id, field_id)
);
```

---

### 11.2 Leave Management Tables

**`leave_types` Table** — Admin-created leave types with expiry rules.
```sql
CREATE TABLE leave_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color_code VARCHAR(7),
  days_per_year INT DEFAULT 20,
  is_paid BOOLEAN DEFAULT TRUE,
  allow_carryover BOOLEAN DEFAULT FALSE,
  carryover_limit INT,
  expiry_rule_id INT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (expiry_rule_id) REFERENCES leave_expiry_rules(id),
  INDEX (is_active)
);
```

**`leave_allocations` Table** — Annual or custom allocations per staff.
```sql
CREATE TABLE leave_allocations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  allocated_days INT NOT NULL,
  used_days INT DEFAULT 0,
  carried_over_days INT DEFAULT 0,
  pending_requests INT DEFAULT 0,
  notes TEXT,
  allocation_by INT,
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
  FOREIGN KEY (allocation_by) REFERENCES users(id),
  UNIQUE KEY (user_id, leave_type_id, cycle_start_date),
  INDEX (cycle_start_date, cycle_end_date)
);
```

**`leave_expiry_rules` Table** — Rules for auto-expiry of unused leave.
```sql
CREATE TABLE leave_expiry_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  expire_after_days INT,
  expiry_date_formula VARCHAR(255),
  trigger_notification_days INT,
  auto_expire_action ENUM('delete', 'convert_to_cash', 'transfer_to_next_cycle') DEFAULT 'delete',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX (is_active)
);
```

---

### 11.3 Notification & Audit Tables

**`notification_logs` Table** — Complete audit of all notifications sent (email, push, in-app, SMS).
```sql
CREATE TABLE notification_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipient_user_id INT NOT NULL,
  notification_type ENUM('leave_expiry_warning', 'leave_approved', 'leave_rejected', 'payroll_ready', 'kpi_due', 'appraisal_reminder', 'custom') NOT NULL,
  title VARCHAR(255),
  message TEXT NOT NULL,
  channel ENUM('push', 'email', 'in_app', 'sms') NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id INT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  error_message TEXT,
  external_id VARCHAR(255),
  opened_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_user_id) REFERENCES users(id),
  INDEX (recipient_user_id, notification_type, sent_at),
  INDEX (delivery_status, retry_count),
  INDEX (sent_at)
);
```

**`audit_logs` Table** — Immutable audit trail of all sensitive operations.
```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  before_data JSON,
  after_data JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (entity_type, entity_id, created_at),
  INDEX (user_id, created_at),
  INDEX (action, created_at)
);
```

---

### 11.4 Dynamic Payment & KPI Tables

**`payment_types` Table** — Admin-defined salary components (basic, HRA, bonus, deductions).
```sql
CREATE TABLE payment_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  payment_category ENUM('earning', 'deduction', 'tax', 'benefit') NOT NULL,
  calculation_type ENUM('fixed', 'percentage', 'dynamic', 'formula') NOT NULL,
  formula VARCHAR(500),
  applies_to_all BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (is_active)
);
```

**`kpi_definitions` Table** — Admin-created KPI metrics for appraisal cycles.
```sql
CREATE TABLE kpi_definitions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric_type ENUM('numeric', 'boolean', 'rating', 'text') NOT NULL,
  target_value DECIMAL(10, 2),
  unit VARCHAR(50),
  calculation_formula VARCHAR(500),
  weight DECIMAL(5, 2),
  data_source ENUM('formula', 'manual_entry', 'system_metric') NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (is_active)
);
```

**`kpi_assignments` Table** — Assign KPIs to staff for an appraisal cycle.
```sql
CREATE TABLE kpi_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  kpi_definition_id INT NOT NULL,
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  assigned_by INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  custom_target_value DECIMAL(10, 2),
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (kpi_definition_id) REFERENCES kpi_definitions(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  UNIQUE KEY (user_id, kpi_definition_id, cycle_start_date),
  INDEX (cycle_start_date, cycle_end_date)
);
```

**`kpi_scores` Table** — Calculated KPI scores (refreshed daily by scheduled worker).
```sql
CREATE TABLE kpi_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kpi_assignment_id INT NOT NULL,
  calculated_value DECIMAL(10, 2),
  achievement_percentage DECIMAL(5, 2),
  weighted_score DECIMAL(10, 2),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  manually_overridden BOOLEAN DEFAULT FALSE,
  override_value DECIMAL(10, 2),
  override_reason TEXT,
  override_by INT,
  override_at TIMESTAMP NULL,
  FOREIGN KEY (kpi_assignment_id) REFERENCES kpi_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (override_by) REFERENCES users(id),
  INDEX (calculated_at)
);
```

---

## 12. SCHEDULED WORKERS & BACKGROUND JOBS

### 12.1 Leave Expiry & Notification Worker (Daily 2 AM)

**Purpose:** Scan leave allocations for expiring balances, send notifications, and process auto-expiry.

```javascript
// src/workers/leave-expiry-worker.js

const Queue = require('bull');
const leaveExpiryQueue = new Queue('leave-expiry-scan', { redis });

leaveExpiryQueue.process(async (job) => {
  const db = getConnection();
  
  // Fetch all active leave allocations nearing expiry
  const allocations = await db.query(`
    SELECT la.*, let.name as leave_type_name, ler.trigger_notification_days, ler.auto_expire_action
    FROM leave_allocations la
    JOIN leave_types let ON la.leave_type_id = let.id
    JOIN leave_expiry_rules ler ON let.expiry_rule_id = ler.id
    WHERE la.cycle_end_date <= NOW() + INTERVAL ler.trigger_notification_days DAY
      AND la.used_days < (la.allocated_days + la.carried_over_days)
  `);
  
  for (const alloc of allocations) {
    const daysUntilExpiry = Math.ceil((new Date(alloc.cycle_end_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= alloc.trigger_notification_days && daysUntilExpiry > 0) {
      await sendLeaveExpiryNotification(alloc);
    }
    
    if (daysUntilExpiry <= 0) {
      await processLeaveExpiry(alloc, db);
    }
  }
  
  return { processed: allocations.length };
});

async function sendLeaveExpiryNotification(alloc) {
  const user = await db.query(`SELECT email FROM users WHERE id = ?`, [alloc.user_id]);
  const remainingDays = alloc.allocated_days + alloc.carried_over_days - alloc.used_days;
  
  try {
    // Send email via Resend
    await resend.emails.send({
      from: 'noreply@hrapp.com',
      to: user.email,
      subject: `⏰ ${alloc.leave_type_name} Balance Expiring Soon`,
      html: `<h2>Leave Balance Expiring</h2><p>Your ${alloc.leave_type_name} balance (${remainingDays} days) expires soon.</p>`
    });
    
    // Send push notification
    await sendPushNotification(alloc.user_id, `${alloc.leave_type_name} balance expiring`, `${remainingDays} days remaining`);
    
    // Log notification
    await db.query(`INSERT INTO notification_logs (recipient_user_id, notification_type, message, channel, delivery_status) 
      VALUES (?, ?, ?, ?, ?)`, [alloc.user_id, 'leave_expiry_warning', `${remainingDays} days remaining`, 'email', 'sent']);
  } catch (err) {
    console.error(`Leave expiry notification failed: ${err.message}`);
  }
}

async function processLeaveExpiry(alloc, db) {
  if (alloc.auto_expire_action === 'delete') {
    await db.query(`UPDATE leave_allocations SET used_days = allocated_days + carried_over_days WHERE id = ?`, [alloc.id]);
  } else if (alloc.auto_expire_action === 'convert_to_cash') {
    const dailyRate = 5000 / 22; // configurable
    const remainingDays = alloc.allocated_days + alloc.carried_over_days - alloc.used_days;
    await db.query(`INSERT INTO payroll_adjustments (user_id, type, amount, reason) VALUES (?, ?, ?, ?)`, 
      [alloc.user_id, 'leave_encashment', remainingDays * dailyRate, 'Expired leave payout']);
  }
  
  await db.query(`INSERT INTO audit_logs (action, entity_type, entity_id) VALUES (?, ?, ?)`, 
    ['leave_expired', 'leave_allocation', alloc.id]);
}

const cron = require('node-cron');
cron.schedule('0 2 * * *', async () => await leaveExpiryQueue.add({}));
```

---

### 12.2 KPI Recalculation Worker (Daily 3 AM)

**Purpose:** Recalculate all KPI scores from system metrics (attendance, sales, custom formulas).

```javascript
// src/workers/kpi-recalc-worker.js

const kpiRecalcQueue = new Queue('kpi-recalc', { redis });

kpiRecalcQueue.process(async (job) => {
  const db = getConnection();
  
  const kpis = await db.query(`
    SELECT ka.*, kd.calculation_formula, kd.target_value, kd.weight
    FROM kpi_assignments ka
    JOIN kpi_definitions kd ON ka.kpi_definition_id = kd.id
    WHERE ka.cycle_start_date <= NOW() AND NOW() <= ka.cycle_end_date
  `);
  
  for (const kpi of kpis) {
    let calculatedValue = 0;
    
    if (kpi.calculation_formula === 'attendance_rate') {
      const result = await db.query(`
        SELECT COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*) * 100 as rate
        FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ?
      `, [kpi.user_id, kpi.cycle_start_date, kpi.cycle_end_date]);
      calculatedValue = result[0].rate || 0;
    }
    // Add more formula types as needed (sales_value, custom expressions, etc.)
    
    const achievementPercentage = (calculatedValue / kpi.target_value) * 100;
    const weightedScore = (calculatedValue / kpi.target_value) * kpi.weight;
    
    await db.query(`
      INSERT INTO kpi_scores (kpi_assignment_id, calculated_value, achievement_percentage, weighted_score, calculated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE calculated_value = VALUES(calculated_value)
    `, [kpi.id, calculatedValue, achievementPercentage, weightedScore]);
  }
  
  return { processed: kpis.length };
});

const cron = require('node-cron');
cron.schedule('0 3 * * *', async () => await kpiRecalcQueue.add({}));
```

---

## 13. FORM-BUILDER API ENDPOINTS

### 13.1 Create Form
**POST `/api/forms`** — Admin creates form with fields (leave, appraisal, application, etc.)

```json
{
  "name": "Leave Request Form",
  "form_type": "leave_request",
  "fields": [
    { "field_name": "leave_type", "field_label": "Leave Type", "field_type": "dropdown", "is_required": true, "options": [{"label": "Annual", "value": "annual"}] },
    { "field_name": "start_date", "field_label": "Start Date", "field_type": "date", "is_required": true },
    { "field_name": "attachment", "field_label": "Medical Certificate", "field_type": "file", "is_required": false }
  ]
}
```

### 13.2 Get Form Template
**GET `/api/forms/:id`** — Returns complete form structure with all fields.

### 13.3 Submit Form
**POST `/api/forms/:id/submit`** — Staff submits form with data and file attachments.

```json
{
  "submission_data": { "leave_type": "annual", "start_date": "2026-02-01" },
  "attachments": [{ "field_name": "attachment", "file_url": "s3://bucket/cert.pdf" }]
}
```

### 13.4 Update Submission Status
**PATCH `/api/forms/submissions/:id`** — Admin approves/rejects submission.

```json
{ "status": "approved", "notes": "Approved by HR Manager" }
```

### 13.5 List Submissions
**GET `/api/forms/:id/submissions?status=submitted&limit=10`** — Paginated list with filtering.

---

## 14. DYNAMIC CONFIGURATION EXAMPLES

### 14.1 Admin Creates Leave Type (No Code)
1. Navigate to **Leave Management > Leave Types > Create**.
2. Fill: Name (Sabbatical), Days (7), Carryover (10), Expiry Rule (12 months), Notification (30 days).
3. System saves to DB; scheduled worker automatically uses it in daily expiry scan.

### 14.2 Admin Creates Payment Component (No Code)
1. Navigate to **Payroll > Payment Types > Create**.
2. Fill: Name (Performance Bonus), Formula (`base_salary * 0.15`), Category (Earning).
3. During payroll run, formula is evaluated dynamically and included in salary slip.

### 14.3 Admin Creates Appraisal Form (No Code)
1. Navigate to **Appraisal > Forms > Create**.
2. Add fields: Performance Rating (dropdown), Comments (textarea), Score (number), Documents (file upload).
3. Publish; managers submit appraisals using this form—no database schema changes needed.

---

## 15. END-TO-END WORKFLOW: LEAVE REQUEST

### 15.1 Staff Submits Leave
1. Click "Request Leave" → form-builder renders leave request form.
2. Fill: Leave Type, Start/End Date, Reason.
3. POST `/api/forms/1/submit` with `submission_data` and optional attachments.
4. Backend: Validate fields, check leave balance in `leave_allocations`, insert into `form_submissions`, send email notification via Resend + push notification.

### 15.2 Manager Approves
1. Dashboard shows pending requests.
2. Click "Approve" → PATCH `/api/forms/submissions/101` with `status = "approved"`.
3. Backend: Deduct from `used_days`, create leave record, send approval email + push notification to staff.

### 15.3 Automated Expiry (Daily 2 AM)
1. Worker scans `leave_allocations` where `cycle_end_date` approaches.
2. If trigger date reached (e.g., 30 days before expiry), send leave-expiry-warning email + push notification.
3. On actual expiry date, apply configured action: delete balance, convert to cash payout, or transfer to next cycle.

---

## 17. SUMMARY: WHAT WE'RE BUILDING

**A fully dynamic, zero-hardcoding HR backend** where:

- **Dynamic Forms:** Admins create forms via UI (leave, appraisal, application, feedback, custom documents). Each form field supports text, email, number, date, textarea, dropdown, checkbox, file upload, phone, address. No code changes needed—just click, fill, save.

- **Admin-Driven Configuration:** Leave types, payment types, KPI definitions, roles, permissions—all created via admin dashboard. System reads from `leave_types`, `payment_types`, `kpi_definitions`, `roles` tables, not hardcoded enums.

- **Automated Notifications:** Multi-channel (Resend email, push, in-app, SMS) for leave approvals, expirations, KPI due dates, payroll events. Retry logic with exponential backoff; 95%+ delivery rate.

- **Leave Expiry Engine:** Scheduled worker scans `leave_allocations` daily at 2 AM, sends warnings X days before expiry, executes action on expiry (delete, cash out, transfer to next year).

- **KPI Calculation Engine:** Daily recalculation at 3 AM from attendance, sales, or custom formulas. Weighted scoring for appraisals. Admins define KPIs; system calculates automatically.

- **Individual Work Hours & Holidays:** Per-staff work hours/holidays by default; global and branch overrides via UI. Attendance logic respects these overrides.

- **Atomic RBAC:** Roles + permission atoms (e.g., `attendance:adjust`, `leave:approve`) + per-user overrides. Dynamic permission manifest sent to frontend for conditional rendering.

- **Audit Trail:** Every sensitive operation logged with before/after state, user, IP, user-agent. 7-year immutable retention.

- **cPanel-Ready:** MySQL, Node.js, Resend email, file storage initially on cPanel; migrate to S3 at scale.

- **Multi-Tenant:** Support multiple branches; staff see only their data; admins control permissions per branch.

**Tech Stack:**
- Backend: Node.js + Express or Next.js 14 App Router
- Database: MySQL (cPanel-hosted)
- Jobs: Bull + Redis (or DB fallback if no Redis)
- Email: Resend (95%+ deliverability)
- Auth: JWT + atomic permissions
- Storage: cPanel private storage → S3 at scale
- Monitoring: PM2, Sentry for errors

**This design eliminates maintenance headaches:** Want a new leave type? Admin creates it. New form? Admin designs it. New payment component? Admin configures it. No code deployment needed.
```
