import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { KpiScoreModel } from '../models/kpi-score.model';
import { KpiAssignmentModel } from '../models/kpi-assignment.model';
import UserModel from '../models/user.model';
const router = express.Router();
router.get('/', authenticateJWT, checkPermission('kpi_score:read'), async (req, res) => {
    try {
        const scores = await KpiScoreModel.findAll();
        res.json({
            success: true,
            data: scores
        });
    }
    catch (error) {
        console.error('Error fetching KPI scores:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch KPI scores',
            error: error.message
        });
    }
    return;
});
router.get('/:id', authenticateJWT, checkPermission('kpi_score:read'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid score ID'
            });
        }
        const score = await KpiScoreModel.findById(id);
        if (!score) {
            return res.status(404).json({
                success: false,
                message: 'KPI score not found'
            });
        }
        res.json({
            success: true,
            data: score
        });
    }
    catch (error) {
        console.error('Error fetching KPI score:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch KPI score',
            error: error.message
        });
    }
    return;
});
router.get('/assignment/:assignmentId', authenticateJWT, checkPermission('kpi_score:read'), async (req, res) => {
    try {
        const assignmentIdParam = Array.isArray(req.params.assignmentId) ? req.params.assignmentId[0] : req.params.assignmentId;
        const assignmentId = parseInt(assignmentIdParam);
        if (isNaN(assignmentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid assignment ID'
            });
        }
        const assignment = await KpiAssignmentModel.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'KPI assignment not found'
            });
        }
        const scores = await KpiScoreModel.findByAssignmentId(assignmentId);
        res.json({
            success: true,
            data: scores
        });
    }
    catch (error) {
        console.error('Error fetching KPI scores for assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch KPI scores for assignment',
            error: error.message
        });
    }
    return;
});
router.get('/user/:userId', authenticateJWT, checkPermission('kpi_score:read'), async (req, res) => {
    try {
        const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const userId = parseInt(userIdParam);
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const scores = await KpiScoreModel.findByUserId(userId);
        res.json({
            success: true,
            data: scores
        });
    }
    catch (error) {
        console.error('Error fetching KPI scores for user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch KPI scores for user',
            error: error.message
        });
    }
    return;
});
router.post('/', authenticateJWT, checkPermission('kpi_score.create'), async (req, res) => {
    try {
        const { kpi_assignment_id, calculated_value, achievement_percentage, weighted_score, manually_overridden, override_value, override_reason } = req.body;
        if (kpi_assignment_id === undefined || calculated_value === undefined || achievement_percentage === undefined || weighted_score === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: kpi_assignment_id, calculated_value, achievement_percentage, weighted_score'
            });
        }
        const assignment = await KpiAssignmentModel.findById(kpi_assignment_id);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'KPI assignment not found'
            });
        }
        if (manually_overridden) {
            if (override_value === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Override value is required when manually overriding'
                });
            }
            if (!override_reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Override reason is required when manually overriding'
                });
            }
        }
        const newScore = {
            kpi_assignment_id,
            calculated_value,
            achievement_percentage,
            weighted_score,
            manually_overridden: manually_overridden || false,
            override_value: manually_overridden ? override_value : undefined,
            override_reason: manually_overridden ? override_reason : undefined,
            override_by: manually_overridden ? req.currentUser.id : undefined
        };
        const createdScore = await KpiScoreModel.create(newScore);
        res.status(201).json({
            success: true,
            message: 'KPI score created successfully',
            data: createdScore
        });
    }
    catch (error) {
        console.error('Error creating KPI score:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create KPI score',
            error: error.message
        });
    }
    return;
});
router.put('/:id', authenticateJWT, checkPermission('kpi_score.update'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid score ID'
            });
        }
        const score = await KpiScoreModel.findById(id);
        if (!score) {
            return res.status(404).json({
                success: false,
                message: 'KPI score not found'
            });
        }
        const updatedFields = req.body;
        delete updatedFields.calculated_at;
        if (updatedFields.manually_overridden) {
            if (updatedFields.override_value === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Override value is required when manually overriding'
                });
            }
            if (!updatedFields.override_reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Override reason is required when manually overriding'
                });
            }
            updatedFields.override_by = req.currentUser.id;
        }
        const success = await KpiScoreModel.update(id, updatedFields);
        if (!success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to update KPI score'
            });
        }
        const updatedScore = await KpiScoreModel.findById(id);
        res.json({
            success: true,
            message: 'KPI score updated successfully',
            data: updatedScore
        });
    }
    catch (error) {
        console.error('Error updating KPI score:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update KPI score',
            error: error.message
        });
    }
    return;
});
router.patch('/:id', authenticateJWT, checkPermission('kpi_score.update'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid score ID'
            });
        }
        const score = await KpiScoreModel.findById(id);
        if (!score) {
            return res.status(404).json({
                success: false,
                message: 'KPI score not found'
            });
        }
        const { override_value, override_reason } = req.body;
        if (override_value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Override value is required for manual override'
            });
        }
        if (!override_reason) {
            return res.status(400).json({
                success: false,
                message: 'Override reason is required for manual override'
            });
        }
        const updatedFields = {
            manually_overridden: true,
            override_value,
            override_reason,
            override_by: req.currentUser.id,
            updated_at: new Date()
        };
        const success = await KpiScoreModel.update(id, updatedFields);
        if (!success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to manually override KPI score'
            });
        }
        const updatedScore = await KpiScoreModel.findById(id);
        res.json({
            success: true,
            message: 'KPI score manually overridden successfully',
            data: updatedScore
        });
    }
    catch (error) {
        console.error('Error manually overriding KPI score:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to manually override KPI score',
            error: error.message
        });
    }
    return;
});
router.delete('/:id', authenticateJWT, checkPermission('kpi_score.delete'), async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid score ID'
            });
        }
        const score = await KpiScoreModel.findById(id);
        if (!score) {
            return res.status(404).json({
                success: false,
                message: 'KPI score not found'
            });
        }
        const success = await KpiScoreModel.delete(id);
        if (!success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete KPI score'
            });
        }
        res.json({
            success: true,
            message: 'KPI score deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting KPI score:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete KPI score',
            error: error.message
        });
    }
    return;
});
export default router;
//# sourceMappingURL=kpi-score.route.js.map