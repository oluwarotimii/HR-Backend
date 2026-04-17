import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/database';
import StaffDocumentModel from '../models/staff-document.model';

export interface UploadedDocument {
  id: number;
  staff_id: number;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_at: string;
}

/**
 * Upload staff document
 * POST /api/staff/:id/documents
 */
export const uploadStaffDocument = async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.id as string);
    const documentType = req.body.document_type;
    const uploadedBy = req.currentUser?.id;

    if (!staffId || isNaN(staffId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff ID'
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF or image file.'
      });
    }

    const files = req.files as Express.Multer.File[];
    
    // Validate file type
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const file = files[0];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      // Delete the uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only PDF and images (JPG, PNG) are allowed.'
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit.'
      });
    }

    // Create document record in database
    const documentData = {
      staff_id: staffId,
      document_type: documentType,
      document_name: file.originalname,
      file_path: `/uploads/staff-documents/${path.basename(file.filename)}`,
      file_size: file.size,
      mime_type: file.mimetype,
      uploaded_by: uploadedBy || 1, // Default to 1 if not set
      expiry_date: null
    };

    const createdDocument = await StaffDocumentModel.create(documentData);

    const uploadedDocument: UploadedDocument = {
      id: createdDocument.id,
      staff_id: staffId,
      document_type: documentType,
      document_name: file.originalname,
      file_path: `/uploads/staff-documents/${path.basename(file.filename)}`,
      file_size: file.size,
      mime_type: file.mimetype,
      uploaded_by: uploadedBy || 1,
      uploaded_at: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: uploadedDocument
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
};

/**
 * Get staff documents
 * GET /api/staff/:id/documents
 */
export const getStaffDocuments = async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.id as string);

    if (!staffId || isNaN(staffId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff ID'
      });
    }

    const documents = await StaffDocumentModel.findByStaffId(staffId);

    return res.status(200).json({
      success: true,
      message: 'Documents retrieved successfully',
      data: {
        documents: documents,
        total: documents.length
      }
    });
  } catch (error: any) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve documents'
    });
  }
};

/**
 * Get specific staff document
 * GET /api/staff/documents/:documentId
 */
export const getStaffDocument = async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.documentId as string);

    if (!documentId || isNaN(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }

    const document = await StaffDocumentModel.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Document retrieved successfully',
      data: {
        document
      }
    });
  } catch (error: any) {
    console.error('Get document error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve document'
    });
  }
};

/**
 * Delete staff document
 * DELETE /api/staff/documents/:documentId
 */
export const deleteStaffDocument = async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.documentId as string);

    if (!documentId || isNaN(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }

    const document = await StaffDocumentModel.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete physical file
    const filePath = path.join(process.cwd(), document.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await pool.execute('DELETE FROM staff_documents WHERE id = ?', [documentId]);

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete document error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete document'
    });
  }
};

/**
 * Serve uploaded staff documents
 * GET /uploads/staff-documents/:filename
 */
export const serveStaffDocument = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    
    // Try to serve the file
    const filePath = path.join(process.cwd(), 'uploads', 'staff-documents', req.params.filename as string);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.sendFile(filePath);
  } catch (error: any) {
    console.error('Serve document error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to serve document'
    });
  }
};
