# 📎 Leave Request File Upload - Frontend Implementation Guide

## Backend Implementation Complete ✅

### Available Endpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/leave/upload` | `leave:create` | Upload files (max 5 files, 5MB each) |
| `GET` | `/api/leave/:id/files` | Owner or `leave:read` | Get files for a leave request |
| `DELETE` | `/api/leave/:id/files/:fileIndex` | Owner or `leave:delete` | Delete a file from request |
| `GET` | `/uploads/leave-requests/:filename` | Public | Download/view file |

---

## 📦 File Upload Flow

### Option 1: Upload During Request Submission

```typescript
// 1. First upload files
const uploadFiles = async (files: File[]) => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/leave/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.files; // Array of uploaded file objects
};

// 2. Then submit leave request with attachments
const submitLeaveRequest = async (requestData, attachments) => {
  const response = await api.post('/leave', {
    ...requestData,
    attachments, // Array of file objects from upload
  });

  return response.data;
};

// Usage in form submission
const handleSubmit = async (data) => {
  try {
    let attachments = [];
    
    // Upload files if any
    if (data.files && data.files.length > 0) {
      attachments = await uploadFiles(data.files);
    }

    // Submit request
    await submitLeaveRequest({
      leave_type_id: data.leaveTypeId,
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason,
      attachments: attachments.length > 0 ? attachments : null,
    });

    toast.success('Leave request submitted successfully');
  } catch (error) {
    toast.error('Failed to submit request');
  }
};
```

---

### Option 2: Upload Files Separately (Before Submission)

```typescript
// User can upload files first, save them, then submit later
const uploadFilesEarly = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await api.post('/leave/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // Store file objects in state/localStorage
  return response.data.data.files;
};

// Then when submitting, include the stored attachments
const submitWithStoredFiles = (requestData, storedAttachments) => {
  return api.post('/leave', {
    ...requestData,
    attachments: storedAttachments,
  });
};
```

---

## 🎨 Frontend Components to Build

### 1. File Upload Component

```tsx
// components/FileUpload.tsx
interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  maxSizeMB = 5,
  acceptedTypes = ['application/pdf', 'image/*', 'application/msword']
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} exceeds ${maxSizeMB}MB`);
        return;
      }
      
      if (!acceptedTypes.some(type => file.type.match(type) || type.endsWith('/*'))) {
        setError(`${file.name} has invalid file type`);
        return;
      }
    }

    // Upload files
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await api.post('/leave/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onFilesUploaded(response.data.data.files);
      toast.success('Files uploaded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

---

### 2. File List Component (Display Uploaded Files)

```tsx
// components/FileList.tsx
interface FileListProps {
  files: UploadedFile[];
  onDelete?: (fileIndex: number) => void;
  leaveRequestId?: number;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, leaveRequestId }) => {
  const handleDownload = (file: UploadedFile) => {
    // Open file in new tab or download
    window.open(`${API_BASE_URL}${file.file_path}`, '_blank');
  };

  const handleDelete = async (index: number, file: UploadedFile) => {
    if (!leaveRequestId || !onDelete) return;

    try {
      await api.delete(`/leave/${leaveRequestId}/files/${index}`);
      onDelete(index);
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="file-list">
      {files.map((file, index) => (
        <div key={index} className="file-item">
          <span className="file-icon">{getFileIcon(file.mime_type)}</span>
          <div className="file-info">
            <span className="file-name">{file.file_name}</span>
            <span className="file-size">{formatFileSize(file.file_size)}</span>
          </div>
          <div className="file-actions">
            <button onClick={() => handleDownload(file)}>
              Download
            </button>
            {onDelete && (
              <button 
                onClick={() => handleDelete(index, file)}
                className="delete-btn"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

### 3. Leave Request Form with Attachments

```tsx
// pages/LeaveRequestForm.tsx
const LeaveRequestForm: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileSelect = (newFiles: UploadedFile[]) => {
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleFileDelete = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data) => {
    try {
      await api.post('/leave', {
        leave_type_id: data.leaveTypeId,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : null,
      });

      toast.success('Leave request submitted!');
      navigate('/leave/my-requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      
      <div className="form-section">
        <label>Attachments (Optional)</label>
        <p className="help-text">
          Upload supporting documents (medical certificate, etc.)
          Max 5 files, 5MB each. PDF, JPG, PNG, DOC, DOCX allowed.
        </p>
        
        <FileUpload onFilesUploaded={handleFileSelect} />
        
        {uploadedFiles.length > 0 && (
          <FileList 
            files={uploadedFiles} 
            onDelete={handleFileDelete}
          />
        )}
      </div>

      <button type="submit">Submit Request</button>
    </form>
  );
};
```

---

### 4. View Request Details with Files

```tsx
// pages/LeaveRequestDetails.tsx
const LeaveRequestDetails: React.FC<{ id: string }> = ({ id }) => {
  const [request, setRequest] = useState(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await api.get(`/leave/${id}`);
      setRequest(response.data.data.leaveRequest);
      
      if (response.data.data.leaveRequest.attachments) {
        setFiles(JSON.parse(response.data.data.leaveRequest.attachments));
      }
    };

    fetchDetails();
  }, [id]);

  if (!request) return <Loading />;

  return (
    <div className="leave-request-details">
      {/* Request info */}
      <h2>Leave Request #{request.id}</h2>
      <p>Type: {request.leave_type_name}</p>
      <p>Dates: {request.start_date} - {request.end_date}</p>
      <p>Days: {request.days_requested}</p>
      <p>Reason: {request.reason}</p>
      <p>Status: <StatusBadge status={request.status} /></p>

      {/* Attachments section */}
      {files && files.length > 0 && (
        <div className="attachments-section">
          <h3>Attachments ({files.length})</h3>
          <FileList files={files} />
        </div>
      )}

      {/* Approve/Reject buttons for approvers */}
      {canApprove && request.status === 'submitted' && (
        <div className="approval-actions">
          <button onClick={() => handleApprove(id)}>Approve</button>
          <button onClick={() => handleReject(id)}>Reject</button>
        </div>
      )}
    </div>
  );
};
```

---

## ⚠️ Important Notes

### 1. File Validation (Frontend + Backend)

**Frontend validation:**
```typescript
const validateFiles = (files: File[]) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.name}`);
    }
    if (file.size > maxSize) {
      throw new Error(`File too large: ${file.name}`);
    }
  }
};
```

**Backend also validates** (in middleware), but frontend gives instant feedback.

---

### 2. File Storage Structure

```
hrApp/
├── uploads/
│   └── leave-requests/
│       ├── leave-1740567890123-456789.pdf
│       ├── leave-1740567891234-567890.jpg
│       └── ...
```

Files are stored with unique names to prevent conflicts.

---

### 3. File URL Format

**Stored in database:**
```json
{
  "file_path": "/uploads/leave-requests/leave-1740567890123-456789.pdf"
}
```

**Frontend access:**
```typescript
const fileUrl = `${API_BASE_URL}${file.file_path}`;
// Example: http://localhost:3000/uploads/leave-requests/leave-1740567890123-456789.pdf
```

---

### 4. When to Allow File Deletion

**Backend rules:**
- ✅ Can delete if request status is `submitted` or `pending`
- ❌ Cannot delete if request is `approved` or `rejected`

**Frontend should:**
- Show delete button only when appropriate
- Disable delete after approval/rejection

---

## 🧪 Testing Checklist

### Upload Flow:
- [ ] Can upload single file
- [ ] Can upload multiple files (up to 5)
- [ ] Gets error for invalid file type
- [ ] Gets error for file > 5MB
- [ ] Gets error for > 5 files
- [ ] Upload progress indicator works
- [ ] Success message shows after upload

### Request Submission:
- [ ] Can submit request without attachments
- [ ] Can submit request with attachments
- [ ] Attachments are saved correctly
- [ ] Can view attachments in request details

### File Management:
- [ ] Can download attached files
- [ ] Can delete files (when allowed)
- [ ] Cannot delete after approval
- [ ] File list shows correct info (name, size)

---

## 🎯 Implementation Priority

```
1. File upload component (2 hours)
   └── Drag & drop or file picker
   └── Validation
   └── Upload progress

2. File list component (1 hour)
   └── Display uploaded files
   └── Download button
   └── Delete button

3. Integrate with leave request form (1 hour)
   └── Add upload component to form
   └── Save attachments with request
   └── Test complete flow

4. View attachments in details page (30 min)
   └── Fetch and display files
   └── Download from details

Total: ~4.5 hours
```

---

## 📞 Backend Support

If you need any changes to the API:

1. **Different file limits?** → Update `upload.middleware.ts`
2. **Different file types?** → Update `fileFilter` in middleware
3. **Custom storage location?** → Update `destination` in storage config
4. **Need file preview?** → Can add thumbnail generation endpoint

Let me know if you need any adjustments!
