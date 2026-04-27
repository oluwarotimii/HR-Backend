import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import UserModel from '../models/user.model';
import StaffModel from '../models/staff.model';

// Configure multer for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'profile-photos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = (req as any).resolvedUserId ?? req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `user-${userId}-${Date.now()}${ext}`);
  }
});

export const upload = multer({
  storage,
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

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    console.log('========================================');
    console.log('[Backend] Upload profile photo request received');
    console.log('========================================');
    console.log('[Backend] User ID param:', req.params.id);
    console.log('[Backend] Current user ID:', req.currentUser?.id);
    console.log('[Backend] File:', req.file);
    
    if (!req.currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const rawId = parseInt(req.params.id as string);

    if (Number.isNaN(rawId)) {
      console.log('[Backend] ❌ Invalid user ID');
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const preResolvedUserId = (req as any).resolvedUserId;
    const isSuperAdmin = req.currentUser.role_id === 1;

    let resolvedUserId =
      typeof preResolvedUserId === 'number' && Number.isInteger(preResolvedUserId)
        ? preResolvedUserId
        : req.currentUser.id;

    // SECURITY: never trust the URL param for non-admin self-service uploads.
    // This prevents the historical "staff.id vs user.id" mixup from writing to another user.
    if (!preResolvedUserId && isSuperAdmin) {
      if (rawId === req.currentUser.id) {
        resolvedUserId = rawId;
      } else {
      const idType = String(req.query.idType || req.query.id_type || '').toLowerCase();

      if (idType === 'staff') {
        const staff = await StaffModel.findById(rawId);
        if (!staff) {
          return res.status(404).json({
            success: false,
            message: 'Staff record not found for the provided staff ID'
          });
        }
        resolvedUserId = staff.user_id;
      } else if (idType === 'user') {
        const user = await UserModel.findById(rawId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found for the provided user ID'
          });
        }
        resolvedUserId = rawId;
      } else {
        // Auto-resolve with a safety check for ambiguous identifiers.
        const [user, staffByStaffId] = await Promise.all([
          UserModel.findById(rawId),
          StaffModel.findById(rawId)
        ]);

        if (user && staffByStaffId && staffByStaffId.user_id !== rawId) {
          return res.status(409).json({
            success: false,
            message: 'Ambiguous identifier: matches both a user ID and a staff ID. Retry with ?idType=user or ?idType=staff.'
          });
        }

        resolvedUserId = staffByStaffId ? staffByStaffId.user_id : rawId;
      }
      }
    }

    if (!req.file) {
      console.log('[Backend] ❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Update user profile picture
    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    console.log('[Backend] Updating user', resolvedUserId, 'with photo URL:', photoUrl);
    
    await UserModel.update(resolvedUserId, { profile_picture: photoUrl });
    
    console.log('[Backend] ✅ Profile photo uploaded successfully');

    return res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profile_picture_url: photoUrl
      }
    });
  } catch (error) {
    console.error('[Backend] Upload photo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo'
    });
  }
};
