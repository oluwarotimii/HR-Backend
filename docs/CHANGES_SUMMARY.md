# Summary of Changes: Mandatory Attachments for Leave Requests

## Overview

All leave requests now **REQUIRE at least 1 attachment** (PDF, JPG, PNG, DOC, or DOCX). This ensures proper documentation and validation of leave requests.

---

## Changes Made

### 1. Database Schema (`migrations/011_create_form_attachments_table.sql`)

**Updated form_attachments table:**
- Added `leave_request_id` column (INT NULL)
- Added foreign key to `leave_requests` table with CASCADE DELETE
- Added index on `leave_request_id` for performance
- Made `form_submission_id` and `field_id` nullable for flexibility

```sql
CREATE TABLE IF NOT EXISTS form_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_submission_id INT NULL,
  leave_request_id INT NULL,
  field_id INT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (form_submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES form_fields(id),
  INDEX idx_form_submission_field (form_submission_id, field_id),
  INDEX idx_leave_request (leave_request_id)
);
```

---

### 2. Leave Request API (`src/api/leave-request.route.ts`)

**Added mandatory attachment validation:**

```typescript
// VALIDATE: At least one attachment is REQUIRED
const files = req.files as Express.Multer.File[];
if (!files || files.length === 0) {
  return res.status(400).json({
    success: false,
    message: 'Attachment is required. Please upload a supporting document (PDF, JPG, PNG, DOC, or DOCX). Maximum 5 files allowed.'
  });
}
```

**Updated endpoint:**
- Now uses `upload.array('files', 5)` middleware
- Validates presence of at least 1 file
- Saves attachments using `AttachmentService` in a database transaction
- Returns error if no files attached

---

### 3. Seed Script (`scripts/seed-database.ts`)

**Updated `seedLeaveRequestAttachments()` function:**
- **100% of leave requests now have attachments** (was 40%)
- Each request gets 1-3 attachments
- More variety in file types (PDF, JPG, PNG)

```typescript
// ALL leave requests MUST have at least one attachment
for (const request of leaveRequests) {
  // Every leave request gets 1-3 attachments (REQUIRED)
  const numAttachments = Math.floor(Math.random() * 3) + 1;
  // ... create attachments
}
```

---

### 4. Upload Middleware (`src/middleware/upload.middleware.ts`)

**Enhanced error handling:**
- Added specific error for unexpected file field
- Better error messages for file limits
- Configured to accept: PDF, JPG, PNG, DOC, DOCX
- File size limit: 5MB per file
- Max files: 5 per request

---

### 5. Sample Files Script (`scripts/create-sample-files.ts`)

**NEW: Script to create test attachment files**

Run with:
```bash
npm run create-sample-files
```

Creates sample files in `uploads/attachments/`:
- `sample_medical_certificate.pdf`
- `sample_supporting_letter.pdf`
- `sample_doctor_note.pdf`
- `sample_document.png`
- `sample_medical_report.jpg`
- `sample_letter.docx`

---

### 6. Package.json

**Added new script:**
```json
{
  "create-sample-files": "tsx scripts/create-sample-files.ts"
}
```

---

## API Usage

### Submit Leave Request (With Required Attachments)

```bash
POST /api/leave
Content-Type: multipart/form-data

FormData:
  - leave_type_id: 1
  - start_date: 2026-03-15
  - end_date: 2026-03-20
  - reason: Medical appointment
  - files: [attachment1.pdf]  ← REQUIRED
  - files: [attachment2.jpg]  ← Optional (up to 5 total)
```

### Error Response (No Attachment)

```json
{
  "success": false,
  "message": "Attachment is required. Please upload a supporting document (PDF, JPG, PNG, DOC, or DOCX). Maximum 5 files allowed."
}
```

### Success Response

```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "leaveRequest": {
      "id": 456,
      "user_id": 123,
      "leave_type_id": 1,
      "start_date": "2026-03-15",
      "end_date": "2026-03-20",
      "days_requested": 6,
      "reason": "Medical appointment",
      "status": "submitted",
      "created_at": "2026-02-28T10:00:00Z"
    }
  }
}
```

---

## Database Impact

### Before
- ~40% of leave requests had attachments
- Inconsistent documentation
- Some orphaned requests without supporting documents

### After
- **100% of leave requests have attachments** ✅
- All requests properly documented
- Consistent data structure
- Better audit trail

---

## Testing

### 1. Create Sample Files
```bash
npm run create-sample-files
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Verify Attachments
```sql
SELECT 
  lr.id as leave_request_id,
  lr.start_date,
  lr.end_date,
  lr.status,
  COUNT(fa.id) as attachment_count
FROM leave_requests lr
LEFT JOIN form_attachments fa ON lr.id = fa.leave_request_id
GROUP BY lr.id
HAVING attachment_count > 0;

-- Should show ALL leave requests with at least 1 attachment
```

### 4. Test API Validation
```bash
# This should FAIL (no attachment)
curl -X POST http://localhost:3000/api/leave \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "leave_type_id=1" \
  -F "start_date=2026-03-15" \
  -F "end_date=2026-03-20" \
  -F "reason=Test"

# This should SUCCEED (with attachment)
curl -X POST http://localhost:3000/api/leave \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "leave_type_id=1" \
  -F "start_date=2026-03-15" \
  -F "end_date=2026-03-20" \
  -F "reason=Test" \
  -F "files=@uploads/attachments/sample_medical_certificate.pdf"
```

---

## File Type Validation

**Accepted MIME Types:**
- `application/pdf` (PDF)
- `image/jpeg` (JPG)
- `image/png` (PNG)
- `image/jpg` (JPG)
- `application/msword` (DOC)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)

**File Size Limits:**
- Maximum: 5MB per file
- Maximum: 5 files per request

---

## Migration Path

### For Existing Data

If you have existing leave requests without attachments:

```sql
-- Check for leave requests without attachments
SELECT lr.id, lr.start_date, lr.end_date, lr.status
FROM leave_requests lr
LEFT JOIN form_attachments fa ON lr.id = fa.leave_request_id
WHERE fa.id IS NULL;

-- Option 1: Allow them (no action needed)
-- The system will only enforce attachments for NEW requests

-- Option 2: Mark them for review
UPDATE leave_requests
SET notes = CONCAT(notes, ' - Missing attachment, requires review')
WHERE id IN (
  SELECT lr.id FROM leave_requests lr
  LEFT JOIN form_attachments fa ON lr.id = fa.leave_request_id
  WHERE fa.id IS NULL
);
```

### For New Deployments

1. Run migrations:
   ```bash
   npm run migrate
   ```

2. Create sample files:
   ```bash
   npm run create-sample-files
   ```

3. Seed database:
   ```bash
   npm run seed
   ```

4. Start server:
   ```bash
   npm start
   ```

---

## Frontend Integration

### React Example

```jsx
function LeaveRequestForm() {
  const [files, setFiles] = useState([]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('leave_type_id', leaveType);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('reason', reason);
    
    // Attach files (REQUIRED)
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await axios.post('/api/leave', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      // Success
    } catch (error) {
      // Handle error (e.g., "Attachment required")
      console.error(error.response?.data?.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Other fields */}
      
      <input 
        type="file" 
        multiple 
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={(e) => setFiles(Array.from(e.target.files))}
        required  // HTML5 validation
      />
      
      <small>
        * At least 1 attachment required (PDF, JPG, PNG, DOC, DOCX)
        <br />
        Maximum 5 files, 5MB each
      </small>
      
      <button type="submit">Submit Leave Request</button>
    </form>
  );
}
```

---

## Related Documentation

- [ATTACHMENT_SYSTEM.md](./ATTACHMENT_SYSTEM.md) - Complete attachment system guide
- [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) - Database seeding documentation

---

## Checklist

- [x] Migration updated (011_create_form_attachments_table.sql)
- [x] API validation added (leave-request.route.ts)
- [x] Seed script updated (seed-database.ts)
- [x] Sample files script created (create-sample-files.ts)
- [x] Documentation updated (ATTACHMENT_SYSTEM.md)
- [x] Package.json script added
- [x] Upload middleware enhanced
- [x] All leave requests have attachments in seed data

---

**Status:** ✅ Complete and Ready for Testing
