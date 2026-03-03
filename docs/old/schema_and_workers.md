# HR Backend - Schemas, Workers, API & Workflows

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

**`notification_logs` Table** — Complete audit of all notifications sent.
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

**`audit_logs` Table** — Immutable audit trail of sensitive operations.
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

**`payment_types` Table** — Admin-defined salary components.
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

**`kpi_definitions` Table** — Admin-created KPI metrics for appraisal.
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

**`kpi_scores` Table** — Calculated/recorded KPI scores (refreshed by scheduled job).
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

### 12.1 Leave Expiry & Notification Worker

**Purpose:** Scan leave allocations for expiring balances, create notifications, and process auto-expiry.

```javascript
// src/workers/leave-expiry-worker.js

const Queue = require('bull');
const leaveExpiryQueue = new Queue('leave-expiry-scan', { redis });

// Trigger: Daily at 2 AM
leaveExpiryQueue.process(async (job) => {
  const db = getConnection();
  
  // 1. Fetch all active leave allocations nearing expiry
  const allocations = await db.query(`
    SELECT la.*, let.name as leave_type_name, ler.expire_after_days, ler.trigger_notification_days, ler.auto_expire_action
    FROM leave_allocations la
    JOIN leave_types let ON la.leave_type_id = let.id
    JOIN leave_expiry_rules ler ON let.expiry_rule_id = ler.id
    WHERE la.cycle_end_date <= NOW() + INTERVAL ler.trigger_notification_days DAY
      AND la.used_days < (la.allocated_days + la.carried_over_days)
  `);
  
  // 2. For each allocation, check if trigger notification date is reached
  for (const alloc of allocations) {
    const daysUntilExpiry = Math.ceil((new Date(alloc.cycle_end_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= alloc.trigger_notification_days && daysUntilExpiry > 0) {
      // Send notification
      await sendLeaveExpiryNotification(alloc);
    }
    
    // If expiry date passed, auto-expire
    if (daysUntilExpiry <= 0) {
      await processLeaveExpiry(alloc, db);
    }
  }
  
  return { processed: allocations.length };
});

// Helper: Send notifications via Resend + push
async function sendLeaveExpiryNotification(alloc) {
  const user = await db.query(`SELECT email, language FROM users WHERE id = ?`, [alloc.user_id]);
  const remainingDays = alloc.allocated_days + alloc.carried_over_days - alloc.used_days;
  
  try {
    // Send email via Resend
    await resend.emails.send({
      from: 'noreply@hrapp.com',
      to: user.email,
      subject: `⏰ ${alloc.leave_type_name} Balance Expiring Soon`,
      html: `<h2>Leave Balance Expiring</h2><p>Your ${alloc.leave_type_name} balance (${remainingDays} days) expires in ${daysUntilExpiry} days.</p>`
    });
    
    // Send push notification
    await sendPushNotification(alloc.user_id, `${alloc.leave_type_name} balance expiring`, `${remainingDays} days remaining`);
    
    // Log notification
    await db.query(`
      INSERT INTO notification_logs 
      (recipient_user_id, notification_type, title, message, channel, related_entity_type, related_entity_id, delivery_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      alloc.user_id,
      'leave_expiry_warning',
      `${alloc.leave_type_name} expiring in ${daysUntilExpiry} days`,
      `You have ${remainingDays} days of ${alloc.leave_type_name} remaining.`,
      'email',
      'leave_allocation',
      alloc.id,
      'sent'
    ]);
  } catch (err) {
    console.error(`Failed to send leave expiry notification: ${err.message}`);
  }
}

// Helper: Process expiry (delete, convert to cash, or transfer)
async function processLeaveExpiry(alloc, db) {
  const expiryAction = alloc.auto_expire_action;
  const remainingDays = alloc.allocated_days + alloc.carried_over_days - alloc.used_days;
  
  if (expiryAction === 'delete') {
    await db.query(`UPDATE leave_allocations SET used_days = allocated_days + carried_over_days WHERE id = ?`, [alloc.id]);
  } else if (expiryAction === 'convert_to_cash') {
    // Create payroll adjustment
    const dailyRate = (alloc.user_base_salary || 5000) / 22; // assuming 22 working days
    await db.query(`
      INSERT INTO payroll_adjustments (user_id, type, amount, reason, effective_date)
      VALUES (?, ?, ?, ?, ?)
    `, [alloc.user_id, 'leave_encashment', remainingDays * dailyRate, 'Expired leave payout', new Date()]);
  } else if (expiryAction === 'transfer_to_next_cycle') {
    const nextYear = new Date(alloc.cycle_end_date);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    // Create next year allocation with carryover
  }
  
  // Log audit
  await db.query(`
    INSERT INTO audit_logs (action, entity_type, entity_id, after_data)
    VALUES (?, ?, ?, ?)
  `, ['leave_expired', 'leave_allocation', alloc.id, JSON.stringify(alloc)]);
}

// Scheduled trigger (via node-cron)
const cron = require('node-cron');
cron.schedule('0 2 * * *', async () => {
  await leaveExpiryQueue.add({});
});
```

---

### 12.2 KPI Recalculation Worker

**Purpose:** Periodically recalculate KPI scores from system metrics.

```javascript
// src/workers/kpi-recalc-worker.js

const kpiRecalcQueue = new Queue('kpi-recalc', { redis });

// Trigger: Daily at 3 AM
kpiRecalcQueue.process(async (job) => {
  const db = getConnection();
  
  // Fetch all active KPI assignments in current cycle
  const kpis = await db.query(`
    SELECT ka.*, kd.calculation_formula, kd.target_value, kd.weight, u.name as user_name
    FROM kpi_assignments ka
    JOIN kpi_definitions kd ON ka.kpi_definition_id = kd.id
    JOIN users u ON ka.user_id = u.id
    WHERE ka.cycle_start_date <= NOW() AND NOW() <= ka.cycle_end_date
  `);
  
  for (const kpi of kpis) {
    let calculatedValue = 0;
    
    if (kpi.calculation_formula === 'attendance_rate') {
      calculatedValue = await calculateAttendanceRate(kpi.user_id, kpi.cycle_start_date, kpi.cycle_end_date);
    } else if (kpi.calculation_formula === 'sales_value') {
      calculatedValue = await calculateSalesValue(kpi.user_id, kpi.cycle_start_date, kpi.cycle_end_date);
    } else {
      calculatedValue = await evaluateFormula(kpi.calculation_formula, kpi.user_id);
    }
    
    const achievementPercentage = (calculatedValue / kpi.target_value) * 100;
    const weightedScore = (calculatedValue / kpi.target_value) * kpi.weight;
    
    // Upsert KPI score
    await db.query(`
      INSERT INTO kpi_scores (kpi_assignment_id, calculated_value, achievement_percentage, weighted_score, calculated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE calculated_value = VALUES(calculated_value), achievement_percentage = VALUES(achievement_percentage)
    `, [kpi.id, calculatedValue, achievementPercentage, weightedScore]);
  }
  
  return { processed: kpis.length };
});

async function calculateAttendanceRate(userId, startDate, endDate) {
  const result = await db.query(`
    SELECT 
      COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
      COUNT(*) as total_days
    FROM attendance
    WHERE user_id = ? AND date BETWEEN ? AND ?
  `, [userId, startDate, endDate]);
  
  return result[0].total_days > 0 ? (result[0].present_days / result[0].total_days) * 100 : 0;
}

cron.schedule('0 3 * * *', async () => {
  await kpiRecalcQueue.add({});
});
```

---

## 13. FORM-BUILDER API ENDPOINTS

### 13.1 Create Form
**POST `/api/forms`**

```json
{
  "name": "Leave Request Form",
  "description": "Staff request for annual leave",
  "form_type": "leave_request",
  "fields": [
    {
      "field_name": "leave_type",
      "field_label": "Leave Type",
      "field_type": "dropdown",
      "is_required": true,
      "options": [
        { "label": "Annual Leave", "value": "annual" },
        { "label": "Sick Leave", "value": "sick" }
      ]
    },
    {
      "field_name": "start_date",
      "field_label": "Start Date",
      "field_type": "date",
      "is_required": true
    },
    {
      "field_name": "reason",
      "field_label": "Reason",
      "field_type": "textarea",
      "is_required": false
    }
  ]
}
```

### 13.2 Get Form Template
**GET `/api/forms/:id`** — Returns form structure with all fields and options.

### 13.3 Submit Form
**POST `/api/forms/:id/submit`**

```json
{
  "submission_data": {
    "leave_type": "annual",
    "start_date": "2026-02-01",
    "reason": "Vacation"
  },
  "attachments": []
}
```

### 13.4 Update Submission Status
**PATCH `/api/forms/submissions/:id`**

```json
{
  "status": "approved",
  "notes": "Approved by HR Manager"
}
```

### 13.5 List Submissions
**GET `/api/forms/:id/submissions?status=submitted&skip=0&limit=10`**

---

## 14. DYNAMIC CONFIGURATION EXAMPLES

### 14.1 Admin Creates Leave Type
1. Navigate to **Leave Management > Leave Types > Create**.
2. Fill form: Name, Days/Year, Carryover limit, Expiry rule, Notification days.
3. System saves to `leave_types` + `leave_expiry_rules`; workers automatically pick it up.

### 14.2 Admin Creates Payment Component
1. Navigate to **Payroll > Payment Types > Create**.
2. Fill: Name (e.g., "Performance Bonus"), Formula (e.g., `base_salary * 0.15`), Category.
3. Evaluated automatically during payroll computation.

### 14.3 Admin Creates Appraisal Form
1. Navigate to **Appraisal > Forms > Create**.
2. Add form fields: Performance Rating (dropdown), Comments (textarea), Score (number), Attachments (file).
3. Form published; managers/staff submit appraisals using this form.

---

## 15. END-TO-END WORKFLOW: LEAVE REQUEST

### 15.1 Staff Submits Leave
1. Click "Request Leave" → form-builder renders the leave request form.
2. Client validates against `form_fields` rules.
3. POST `/api/forms/1/submit` with `submission_data`.
4. Backend: Validate, check leave balance, insert into `form_submissions`, create audit log, send email.

### 15.2 Manager Approves
1. Manager reviews pending requests in dashboard.
2. Click "Approve" → PATCH `/api/forms/submissions/101` with `status = "approved"`.
3. Backend: Deduct from `leave_allocations.used_days`, create leave record, send approval email to staff.

### 15.3 Automated Expiry (Daily 2 AM)
1. Worker scans `leave_allocations` where expiry date is approaching.
2. If trigger date reached, send leave-expiry-warning email + push notification.
3. On actual expiry date, apply action (delete, convert to cash, or transfer).

---

## 16. KEY FEATURES

- **Zero Hardcoding:** All forms, leave types, payment types, roles created via UI.
- **Dynamic Forms:** File uploads, dropdowns, text fields, dates—all configurable.
- **Automated Notifications:** Email (Resend) + push + in-app for all leave milestones.
- **KPI Engine:** Custom formulas for attendance, sales, performance scoring.
- **Audit Trail:** Every operation logged with before/after state.
- **Scalability:** cPanel-hosted initially; migrate to S3 + multi-region at scale.

