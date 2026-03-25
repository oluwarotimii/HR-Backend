import express from 'express';
import { getAllStaff, getStaffById, createStaff, updateStaff, deleteStaff, terminateStaff, getStaffByDepartment, getCurrentUserStaffDetails, getDynamicFields, createDynamicField, updateDynamicField, deleteDynamicField, getStaffDynamicValues, setStaffDynamicValues } from '../controllers/staff.controller';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
const router = express.Router();
const validateNumericId = (req, res, next) => {
    const id = req.params.id;
    const idString = Array.isArray(id) ? id[0] : id;
    const numericId = parseInt(idString);
    if (isNaN(numericId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid staff ID. Expected a numeric ID.'
        });
    }
    req.numericId = numericId;
    return next();
};
const validateNumericIdParam = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        const idString = Array.isArray(id) ? id[0] : id;
        const numericId = parseInt(idString);
        if (isNaN(numericId)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName}. Expected a numeric ID.`
            });
        }
        req.numericId = numericId;
        return next();
    };
};
router.get('/me', authenticateJWT, getCurrentUserStaffDetails);
router.get('/', authenticateJWT, checkPermission('staff:read'), getAllStaff);
router.get('/:id', authenticateJWT, validateNumericId, (req, res, next) => {
    if (req.currentUser?.id === req.numericId) {
        return next();
    }
    return checkPermission('staff:read')(req, res, next);
}, getStaffById);
router.post('/', authenticateJWT, checkPermission('staff.create'), createStaff);
router.put('/:id', authenticateJWT, checkPermission('staff.update'), validateNumericId, updateStaff);
router.delete('/:id', authenticateJWT, checkPermission('staff.delete'), validateNumericId, deleteStaff);
router.patch('/:id/terminate', authenticateJWT, checkPermission('staff.terminate'), validateNumericId, terminateStaff);
router.get('/department/:department', authenticateJWT, checkPermission('staff:read'), getStaffByDepartment);
router.get('/dynamic-fields', authenticateJWT, checkPermission('staff:read'), getDynamicFields);
router.post('/dynamic-fields', authenticateJWT, checkPermission('staff.create'), createDynamicField);
router.put('/dynamic-fields/:id', authenticateJWT, checkPermission('staff.update'), validateNumericIdParam('id'), updateDynamicField);
router.delete('/dynamic-fields/:id', authenticateJWT, checkPermission('staff.delete'), validateNumericIdParam('id'), deleteDynamicField);
router.get('/dynamic-values/:staffId', authenticateJWT, checkPermission('staff:read'), validateNumericIdParam('staffId'), getStaffDynamicValues);
router.post('/dynamic-values/:staffId', authenticateJWT, checkPermission('staff.update'), validateNumericIdParam('staffId'), setStaffDynamicValues);
export default router;
//# sourceMappingURL=staff.route.js.map