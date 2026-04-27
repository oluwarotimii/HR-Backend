"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePhoto = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const staff_model_1 = __importDefault(require("../models/staff.model"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(process.cwd(), 'uploads', 'profile-photos');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.resolvedUserId ?? req.params.id;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `user-${userId}-${Date.now()}${ext}`);
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
const uploadProfilePhoto = async (req, res) => {
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
        const rawId = parseInt(req.params.id);
        if (Number.isNaN(rawId)) {
            console.log('[Backend] ❌ Invalid user ID');
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const preResolvedUserId = req.resolvedUserId;
        const isSuperAdmin = req.currentUser.role_id === 1;
        let resolvedUserId = typeof preResolvedUserId === 'number' && Number.isInteger(preResolvedUserId)
            ? preResolvedUserId
            : req.currentUser.id;
        if (!preResolvedUserId && isSuperAdmin) {
            if (rawId === req.currentUser.id) {
                resolvedUserId = rawId;
            }
            else {
                const idType = String(req.query.idType || req.query.id_type || '').toLowerCase();
                if (idType === 'staff') {
                    const staff = await staff_model_1.default.findById(rawId);
                    if (!staff) {
                        return res.status(404).json({
                            success: false,
                            message: 'Staff record not found for the provided staff ID'
                        });
                    }
                    resolvedUserId = staff.user_id;
                }
                else if (idType === 'user') {
                    const user = await user_model_1.default.findById(rawId);
                    if (!user) {
                        return res.status(404).json({
                            success: false,
                            message: 'User not found for the provided user ID'
                        });
                    }
                    resolvedUserId = rawId;
                }
                else {
                    const [user, staffByStaffId] = await Promise.all([
                        user_model_1.default.findById(rawId),
                        staff_model_1.default.findById(rawId)
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
        const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
        console.log('[Backend] Updating user', resolvedUserId, 'with photo URL:', photoUrl);
        await user_model_1.default.update(resolvedUserId, { profile_picture: photoUrl });
        console.log('[Backend] ✅ Profile photo uploaded successfully');
        return res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: {
                profile_picture_url: photoUrl
            }
        });
    }
    catch (error) {
        console.error('[Backend] Upload photo error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload profile photo'
        });
    }
};
exports.uploadProfilePhoto = uploadProfilePhoto;
//# sourceMappingURL=staff-photo.controller.js.map