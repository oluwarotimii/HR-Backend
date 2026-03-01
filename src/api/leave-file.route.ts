import { Router } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import { upload, handleMulterError } from '../middleware/upload.middleware';
import {
  uploadLeaveFiles,
  getLeaveRequestFiles,
  deleteLeaveRequestFile,
  serveLeaveFile
} from '../controllers/leave-file.controller';

const router = Router();

// Public routes to serve files (no auth needed for viewing files)
// Support both legacy and new paths
router.get('/uploads/leave-requests/:filename', serveLeaveFile);
router.get('/uploads/attachments/:filename', serveLeaveFile);

// Protected routes
router.use(authenticateJWT);

// Upload files (deprecated - use this only for pre-uploading before request submission)
// Recommended: Upload files together with leave request submission
router.post(
  '/upload',
  checkPermission('leave:create'),
  upload.array('files', 5),
  handleMulterError,
  uploadLeaveFiles
);

// Get files for a leave request
router.get('/:id/files', getLeaveRequestFiles);

// Delete a file from leave request
router.delete('/:id/files/:fileIndex', checkPermission('leave:update'), deleteLeaveRequestFile);

export default router;
