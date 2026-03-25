import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { PerformanceScoreModel } from '../models/performance-score.model';
import { AppraisalAssignmentModel } from '../models/appraisal-assignment.model';
const router = express.Router();
router.get('/:id/performance', authenticateJWT, checkPermission('performance:read'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const employeeId = parseInt(idParam);
        if (isNaN(employeeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }
        const performanceScores = await PerformanceScoreModel.findByEmployeeId(employeeId);
        res.json({
            success: true,
            data: performanceScores
        });
    }
    catch (error) {
        console.error('Error fetching employee performance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee performance',
            error: error.message
        });
    }
    return;
});
router.get('/:id/appraisals', authenticateJWT, checkPermission('appraisal:read'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const employeeId = parseInt(idParam);
        if (isNaN(employeeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }
        const appraisalAssignments = await AppraisalAssignmentModel.findByEmployeeId(employeeId);
        res.json({
            success: true,
            data: appraisalAssignments
        });
    }
    catch (error) {
        console.error('Error fetching employee appraisals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee appraisals',
            error: error.message
        });
    }
    return;
});
router.get('/:id/appraisals/template/:templateId', authenticateJWT, checkPermission('appraisal:read'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const templateIdParam = Array.isArray(req.params.templateId) ? req.params.templateId[0] : req.params.templateId;
        const employeeId = parseInt(idParam);
        const templateId = parseInt(templateIdParam);
        if (isNaN(employeeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }
        if (isNaN(templateId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid template ID'
            });
        }
        res.json({
            success: true,
            data: []
        });
    }
    catch (error) {
        console.error('Error fetching employee appraisals for template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee appraisals for template',
            error: error.message
        });
    }
    return;
});
router.post('/:id/self-assessment', authenticateJWT, checkPermission('appraisal.submit'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const employeeId = parseInt(idParam);
        if (isNaN(employeeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }
        if (req.currentUser.id !== employeeId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to submit self-assessment for another employee'
            });
        }
        const { appraisal_assignment_id, self_assessment_data } = req.body;
        if (!appraisal_assignment_id || !self_assessment_data) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: appraisal_assignment_id, self_assessment_data'
            });
        }
        res.json({
            success: true,
            message: 'Self-assessment submitted successfully'
        });
    }
    catch (error) {
        console.error('Error submitting self-assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit self-assessment',
            error: error.message
        });
    }
    return;
});
router.get('/:id/self-assessment', authenticateJWT, checkPermission('appraisal:read'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const employeeId = parseInt(idParam);
        if (isNaN(employeeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }
        if (req.currentUser.id !== employeeId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view self-assessment for another employee'
            });
        }
        res.json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        console.error('Error fetching self-assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch self-assessment',
            error: error.message
        });
    }
    return;
});
export default router;
//# sourceMappingURL=employee-performance.route.js.map