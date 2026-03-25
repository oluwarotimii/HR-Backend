import { Router } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import { upload, handleMulterError } from '../middleware/upload.middleware';
import { uploadLeaveFiles, getLeaveRequestFiles, deleteLeaveRequestFile, serveLeaveFile } from '../controllers/leave-file.controller';
const router = Router();
router.get('/uploads/leave-requests/:filename', serveLeaveFile);
router.get('/uploads/attachments/:filename', serveLeaveFile);
router.use(authenticateJWT);
router.post('/upload', checkPermission('leave:create'), upload.array('files', 5), handleMulterError, uploadLeaveFiles);
router.get('/:id/files', getLeaveRequestFiles);
router.delete('/:id/files/:fileIndex', checkPermission('leave:update'), deleteLeaveRequestFile);
export default router;
//# sourceMappingURL=leave-file.route.js.map