import { Router } from 'express';
import { getGuarantors, getGuarantor, createGuarantor, updateGuarantor, deleteGuarantor, verifyGuarantor, uploadGuarantorDocument } from '../controllers/guarantor.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'guarantors');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const guarantorId = req.params.id;
        const docType = req.params.documentType;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `guarantor-${guarantorId}-${docType}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF and images are allowed.'));
        }
    }
});
router.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', 'guarantors', filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }
    res.sendFile(filePath);
});
router.get('/staff/:staffId', authenticateJWT, getGuarantors);
router.get('/:id', authenticateJWT, checkPermission('staff:read'), getGuarantor);
router.post('/', authenticateJWT, checkPermission('staff:create'), createGuarantor);
router.put('/:id', authenticateJWT, checkPermission('staff:update'), updateGuarantor);
router.delete('/:id', authenticateJWT, checkPermission('staff:delete'), deleteGuarantor);
router.post('/:id/verify', authenticateJWT, checkPermission('staff:update'), verifyGuarantor);
router.post('/:id/upload/:documentType', authenticateJWT, checkPermission('staff:update'), upload.single('document'), uploadGuarantorDocument);
export default router;
//# sourceMappingURL=guarantor.route.js.map