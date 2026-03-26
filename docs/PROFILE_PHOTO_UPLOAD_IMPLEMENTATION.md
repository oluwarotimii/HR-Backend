# Backend: Add Profile Photo Upload Endpoint

## Add to `Backend/src/api/staff.route.ts`

```typescript
// Add import at top
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for profile photos
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'profile-photos');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const userId = req.params.id;
      const ext = path.extname(file.originalname);
      cb(null, `user-${userId}-${Date.now()}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add route after existing routes
router.post('/:id/upload-photo', authenticateJWT, upload.single('profile_picture'), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Update user profile picture
    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    await UserModel.update(userId, { profile_picture: photoUrl });

    return res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profile_picture_url: photoUrl
      }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo'
    });
  }
});

// Add static file serving route in index.ts
app.use('/uploads/profile-photos', express.static(path.join(process.cwd(), 'uploads', 'profile-photos')));
```

## Update User Model

Add `profile_picture` field to `Backend/src/models/user.model.ts`:

```typescript
interface UserInput {
  // ... existing fields
  profile_picture?: string;
}

interface UserUpdate {
  // ... existing fields  
  profile_picture?: string;
}
```

## Update Auth Controller

Return `needs_password_change` and `needs_profile_completion` flags:

```typescript
// In login response
user: {
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  roleId: user.role_id,
  branchId: user.branch_id,
  status: user.status,
  needs_password_change: !!user.must_change_password,
  needs_profile_completion: !user.phone || !user.date_of_birth // Add your logic
}
```
