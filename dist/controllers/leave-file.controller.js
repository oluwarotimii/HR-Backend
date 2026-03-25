import path from 'path';
import fs from 'fs';
import { pool } from '../config/database';
import AttachmentService from '../services/attachment.service';
export const uploadLeaveFiles = async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files)) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        const files = req.files;
        const uploadedFiles = [];
        for (const file of files) {
            const uploadedFile = {
                file_name: file.originalname,
                file_path: `/uploads/leave-requests/${path.basename(file.filename)}`,
                file_size: file.size,
                mime_type: file.mimetype,
                uploaded_at: new Date().toISOString()
            };
            uploadedFiles.push(uploadedFile);
        }
        return res.status(200).json({
            success: true,
            message: 'Files uploaded successfully. Note: These files are not yet attached to any leave request.',
            data: {
                files: uploadedFiles
            }
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload files'
        });
    }
};
export const getLeaveRequestFiles = async (req, res) => {
    try {
        const idParam = req.params.id;
        const leaveRequestId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
        if (isNaN(leaveRequestId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid leave request ID'
            });
        }
        const [rows] = await pool.execute('SELECT user_id FROM leave_requests WHERE id = ?', [leaveRequestId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }
        const leaveRequest = rows[0];
        const currentUserId = req.currentUser?.id;
        const userHasPermission = req.permissions?.includes('leave:read');
        if (leaveRequest.user_id !== currentUserId && !userHasPermission) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this request'
            });
        }
        const attachments = await AttachmentService.getAttachments({
            entityType: 'leave_request',
            entityId: leaveRequestId
        });
        return res.json({
            success: true,
            data: {
                files: attachments
            }
        });
    }
    catch (error) {
        console.error('Error fetching files:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch files'
        });
    }
};
export const deleteLeaveRequestFile = async (req, res) => {
    try {
        const idParam = req.params.id;
        const fileIndexParam = req.params.fileIndex;
        const leaveRequestId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
        const fileIndex = parseInt(Array.isArray(fileIndexParam) ? fileIndexParam[0] : fileIndexParam);
        if (isNaN(leaveRequestId) || isNaN(fileIndex)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID or file index'
            });
        }
        const [rows] = await pool.execute('SELECT user_id, status FROM leave_requests WHERE id = ?', [leaveRequestId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }
        const leaveRequest = rows[0];
        const currentUserId = req.currentUser?.id;
        const userHasPermission = req.permissions?.includes('leave:delete');
        if (leaveRequest.user_id !== currentUserId && !userHasPermission) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete files from this request'
            });
        }
        if (!['submitted', 'pending'].includes(leaveRequest.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete files from approved/rejected requests'
            });
        }
        const attachments = await AttachmentService.getAttachments({
            entityType: 'leave_request',
            entityId: leaveRequestId
        });
        if (fileIndex < 0 || fileIndex >= attachments.length) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        const fileToDelete = attachments[fileIndex];
        const deleted = await AttachmentService.deleteAttachment(fileToDelete.id);
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete file'
            });
        }
        return res.json({
            success: true,
            message: 'File deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting file:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete file'
        });
    }
};
export const serveLeaveFile = async (req, res) => {
    try {
        const filename = Array.isArray(req.params.filename)
            ? req.params.filename[0]
            : req.params.filename;
        const possiblePaths = [
            path.join(process.cwd(), 'uploads', 'leave-requests', filename),
            path.join(process.cwd(), 'uploads', 'attachments', filename)
        ];
        const filePath = possiblePaths.find(p => fs.existsSync(p));
        if (!filePath) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        return res.sendFile(filePath);
    }
    catch (error) {
        console.error('Error serving file:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to serve file'
        });
    }
};
//# sourceMappingURL=leave-file.controller.js.map