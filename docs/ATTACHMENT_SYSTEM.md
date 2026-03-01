# Unified Attachment System Documentation

## Overview

The HR App now uses a **unified attachment system** that allows file uploads to be associated with various entities (leave requests, form submissions, staff documents, etc.) through a single, reusable service.

## Architecture

### Database Schema

All attachments are stored in the `form_attachments` table with flexible foreign key references:

```sql
CREATE TABLE form_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_submission_id INT NULL,      -- For form submissions
  leave_request_id INT NULL,        -- For leave requests (NEW)
  field_id INT NULL,                -- For specific form fields
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (form_submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES form_fields(id)
);
```

### Service Layer

**`AttachmentService`** (`src/services/attachment.service.ts`)

A reusable service that handles all file attachment operations:

```typescript
// Save attachments for an entity
await AttachmentService.saveAttachments(
  files,                              // Multer files array
  { 
    entityType: 'leave_request',     // or 'form_submission', 'staff', etc.
    entityId: 123                     // ID of the entity
  }
);

// Get attachments for an entity
const attachments = await AttachmentService.getAttachments({
  entityType: 'leave_request',
  entityId: 123
});

// Delete a specific attachment
await AttachmentService.deleteAttachment(attachmentId);

// Delete all attachments for an entity
await AttachmentService.deleteByEntity({
  entityType: 'leave_request',
  entityId: 123
});
```

---

## Leave Request with Attachments

### ⚠️ IMPORTANT: Attachments are REQUIRED

**All leave requests MUST include at least 1 attachment.** Supporting documents are mandatory to validate the leave request.

**Accepted file types:** PDF, JPG, PNG, DOC, DOCX  
**File size limit:** 5MB per file  
**Maximum files:** 5 files per request

### New Flow: Submit Leave Request WITH Files (Required)

**Endpoint:** `POST /api/leave`

**Content-Type:** `multipart/form-data`

**Request:**
```javascript
const formData = new FormData();
formData.append('leave_type_id', '1');
formData.append('start_date', '2026-03-01');
formData.append('end_date', '2026-03-05');
formData.append('reason', 'Medical appointment - see attached certificate');
formData.append('files', medicalCertFile);        // REQUIRED: At least 1 file
formData.append('files', supportingDoc);          // Optional: up to 4 more files
```

**⚠️ If no files are attached, the request will be rejected with:**
```json
{
  "success": false,
  "message": "Attachment is required. Please upload a supporting document (PDF, JPG, PNG, DOC, or DOCX). Maximum 5 files allowed."
}
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "leaveRequest": {
      "id": 456,
      "user_id": 123,
      "leave_type_id": 1,
      "start_date": "2026-03-01",
      "end_date": "2026-03-05",
      "days_requested": 5,
      "reason": "Medical appointment - see attached certificate",
      "status": "submitted",
      "created_at": "2026-02-28T10:00:00Z"
    }
  }
}
```

---

### Legacy Flow: Upload Files Separately (Deprecated)

**Endpoint:** `POST /api/leave/upload`

**Note:** This approach is **deprecated** but still supported for backward compatibility.

**Request:**
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
```

**Response:**
```json
{
  "success": true,
  "message": "Files uploaded successfully. Note: These files are not yet attached to any leave request.",
  "data": {
    "files": [
      {
        "file_name": "medical_cert.pdf",
        "file_path": "/uploads/leave-requests/attachment-123456789.pdf",
        "file_size": 102400,
        "mime_type": "application/pdf",
        "uploaded_at": "2026-02-28T10:00:00Z"
      }
    ]
  }
}
```

**⚠️ Warning:** Files uploaded this way are NOT associated with any leave request. You must manually track the file paths and include them when submitting the leave request.

---

## Managing Attachments

### Get Attachments for a Leave Request

**Endpoint:** `GET /api/leave/:id/files`

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": 789,
        "leave_request_id": 456,
        "file_name": "medical_cert.pdf",
        "file_path": "/uploads/attachments/attachment-123456789.pdf",
        "file_size": 102400,
        "mime_type": "application/pdf",
        "uploaded_at": "2026-02-28T10:00:00Z"
      }
    ]
  }
}
```

### Delete an Attachment

**Endpoint:** `DELETE /api/leave/:id/files/:fileIndex`

**Constraints:**
- Only allowed when leave request status is `submitted` or `pending`
- Requires `leave:update` permission

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Download/View an Attachment

**Endpoint:** `GET /uploads/attachments/:filename` (or `GET /uploads/leave-requests/:filename` for legacy)

**Note:** This is a public endpoint (no authentication required) to allow direct file access.

---

## File Upload Configuration

### Multer Settings (`src/middleware/upload.middleware.ts`)

```typescript
{
  storage: diskStorage,           // Saves to /uploads/attachments or /uploads/leave-requests
  fileFilter: allowedTypes,       // PDF, JPG, PNG, DOC, DOCX
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5MB max per file
    files: 5                      // Max 5 files per request
  }
}
```

### Allowed File Types

- **Images:** JPEG, JPG, PNG
- **Documents:** PDF, DOC, DOCX

### File Size Limits

- **Maximum per file:** 5MB
- **Maximum files per request:** 5

---

## Extending to Other Entities

The `AttachmentService` is designed to be easily extended for other entity types:

### Example: Staff Documents

```typescript
// In your staff document route
router.post(
  '/staff/:id/documents',
  authenticateJWT,
  checkPermission('documents:upload'),
  upload.array('files', 5),
  handleMulterError,
  async (req, res) => {
    const staffId = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];
    
    // Save attachments for staff entity
    const attachments = await AttachmentService.saveAttachments(
      files,
      { entityType: 'staff', entityId: staffId }
    );
    
    res.json({
      success: true,
      data: { attachments }
    });
  }
);
```

### Steps to Add New Entity Type

1. **Add column to `form_attachments` table** (if needed):
   ```sql
   ALTER TABLE form_attachments 
   ADD COLUMN staff_id INT NULL,
   ADD INDEX idx_staff (staff_id),
   ADD CONSTRAINT fk_staff 
   FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;
   ```

2. **Update `AttachmentService`** to handle the new entity type:
   ```typescript
   // In saveAttachments and getAttachments methods
   if (entity.entityType === 'staff') {
     attachmentInput.staff_id = entity.entityId;
   }
   ```

3. **Create routes** for managing attachments for the new entity.

---

## Migration

### Running the Migration

```bash
# Run the migration to add leave_request_id column
mysql -u your_user -p your_database < migrations/015_add_leave_request_to_attachments.sql
```

### Backward Compatibility

The system maintains backward compatibility:
- Old leave requests with JSON attachments still work
- Both legacy (`/uploads/leave-requests/`) and new (`/uploads/attachments/`) file paths are supported
- The deprecated `/api/leave/upload` endpoint still functions

---

## Best Practices

1. **Always use the unified endpoint** (`POST /api/leave` with files) for new features
2. **Use transactions** when creating entities with attachments to ensure data consistency
3. **Leverage `AttachmentService`** for all attachment operations - don't duplicate logic
4. **Validate file types and sizes** on both client and server side
5. **Clean up orphaned files** when deleting entities (handled automatically by cascade delete)

---

## API Summary

| Endpoint | Method | Auth | Permission | Description |
|----------|--------|------|------------|-------------|
| `/api/leave` | POST | ✅ | `leave:create` | Submit leave request with **REQUIRED** attachments (1-5 files) |
| `/api/leave/:id/files` | GET | ✅ | Owner or `leave:read` | Get attachments for leave request |
| `/api/leave/:id/files/:fileIndex` | DELETE | ✅ | Owner or `leave:update` | Delete attachment (only if status is submitted/pending) |
| `/api/leave/upload` | POST | ✅ | `leave:create` | Upload files only (deprecated - not linked to any request) |
| `/uploads/attachments/:filename` | GET | ❌ | Public | Download/view file |
| `/uploads/leave-requests/:filename` | GET | ❌ | Public | Download/view file (legacy) |

**Important Notes:**
- **POST /api/leave** requires at least 1 file attachment - requests without attachments will be rejected
- Accepted file types: PDF, JPG, PNG, DOC, DOCX
- Maximum file size: 5MB per file
- Maximum files: 5 per request

---

## Troubleshooting

### Files not being saved
- Check that the `uploads/` directory exists and is writable
- Verify multer middleware is properly configured

### Transaction rollback issues
- Ensure all database operations within the transaction use the same connection
- Check that `connection.release()` is called in the `finally` block

### File not found errors
- Verify the file path in the database matches the actual file location
- Check both `uploads/attachments/` and `uploads/leave-requests/` directories
