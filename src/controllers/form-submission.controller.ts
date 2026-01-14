import { Request, Response } from 'express';
import FormSubmissionModel, { FormSubmissionInput } from '../models/form-submission.model';
import FormModel from '../models/form.model';
import FormFieldModel from '../models/form-field.model';
import AuditLogModel from '../models/audit-log.model';

// Controller for form submissions
export const getAllFormSubmissions = async (req: Request, res: Response) => {
  try {
    const formId = req.query.formId ? parseInt(req.query.formId as string) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const status = req.query.status as string;
    
    const submissions = await FormSubmissionModel.findAll(formId, userId, status);
    
    res.json({
      success: true,
      message: 'Form submissions retrieved successfully',
      data: { submissions }
    });
  } catch (error) {
    console.error('Get all form submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getFormSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submissionId = parseInt(Array.isArray(id) ? id[0] : id);

    if (isNaN(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    const submission = await FormSubmissionModel.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    return res.json({
      success: true,
      message: 'Form submission retrieved successfully',
      data: { submission }
    });
  } catch (error) {
    console.error('Get form submission by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const submitForm = async (req: Request, res: Response) => {
  try {
    const { form_id, submission_data, status, notes } = req.body;

    if (!form_id || !submission_data) {
      return res.status(400).json({
        success: false,
        message: 'Form ID and submission data are required'
      });
    }

    if (!req.currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate form exists
    const form = await FormModel.findById(form_id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Validate submission data against form fields
    const formFields = await FormFieldModel.findByFormId(form_id);
    const errors: string[] = [];

    for (const field of formFields) {
      const fieldValue = submission_data[field.field_name];

      // Check required fields
      if (field.is_required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
        errors.push(`Field '${field.field_label}' is required`);
      }

      // Validate field type
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        switch (field.field_type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
              errors.push(`Field '${field.field_label}' must be a valid email`);
            }
            break;
          case 'number':
            if (isNaN(fieldValue)) {
              errors.push(`Field '${field.field_label}' must be a number`);
            }
            break;
          case 'date':
            const date = new Date(fieldValue);
            if (isNaN(date.getTime())) {
              errors.push(`Field '${field.field_label}' must be a valid date`);
            }
            break;
          // Add more validations as needed
        }

        // Validate against custom validation rule if provided
        if (field.validation_rule) {
          try {
            const regex = new RegExp(field.validation_rule);
            if (!regex.test(fieldValue)) {
              errors.push(`Field '${field.field_label}' does not match required format`);
            }
          } catch (e) {
            console.warn(`Invalid validation rule for field ${field.field_name}: ${field.validation_rule}`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Create the form submission
    const submissionData: FormSubmissionInput = {
      form_id,
      user_id: req.currentUser.id,
      submission_data,
      status: status || 'submitted',
      notes
    };

    const newSubmission = await FormSubmissionModel.create(submissionData);

    // Log the form submission
    await AuditLogModel.logStaffOperation(
      req.currentUser.id,
      'form.submitted',
      newSubmission.id,
      null,
      newSubmission,
      req.ip,
      req.get('User-Agent') || undefined
    );

    return res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: { submission: newSubmission }
    });
  } catch (error) {
    console.error('Submit form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateFormSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submissionId = parseInt(Array.isArray(id) ? id[0] : id);
    const { status, reviewed_by, reviewed_at, notes } = req.body;

    if (isNaN(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    // Check if submission exists
    const existingSubmission = await FormSubmissionModel.findById(submissionId);
    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (reviewed_by !== undefined) updateData.reviewed_by = reviewed_by;
    if (reviewed_at !== undefined) updateData.reviewed_at = reviewed_at;
    if (notes !== undefined) updateData.notes = notes;

    const updatedSubmission = await FormSubmissionModel.update(submissionId, updateData);

    // Log the form submission update
    if (req.currentUser) {
      await AuditLogModel.logStaffOperation(
        req.currentUser.id,
        'form.submission.updated',
        submissionId,
        existingSubmission,
        updatedSubmission,
        req.ip,
        req.get('User-Agent') || undefined
      );
    }

    return res.json({
      success: true,
      message: 'Form submission updated successfully',
      data: { submission: updatedSubmission }
    });
  } catch (error) {
    console.error('Update form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteFormSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submissionId = parseInt(Array.isArray(id) ? id[0] : id);

    if (isNaN(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    const deleted = await FormSubmissionModel.delete(submissionId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    return res.json({
      success: true,
      message: 'Form submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};