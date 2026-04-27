"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const staff_controller_1 = require("../controllers/staff.controller");
const staff_photo_controller_1 = require("../controllers/staff-photo.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const staff_model_1 = __importDefault(require("../models/staff.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const router = express_1.default.Router();
const validateNumericId = (req, res, next) => {
    const id = req.params.id || req.params.userId || req.params.staffId;
    const idString = Array.isArray(id) ? id[0] : id;
    const numericId = parseInt(idString);
    console.log('[Backend Route] validateNumericId called');
    console.log('[Backend Route] req.params:', req.params);
    console.log('[Backend Route] Extracted id param:', id);
    console.log('[Backend Route] idString:', idString);
    console.log('[Backend Route] Parsed numericId:', numericId);
    console.log('[Backend Route] isNaN(numericId):', isNaN(numericId));
    if (isNaN(numericId)) {
        console.log('[Backend Route] ❌ Invalid numeric ID');
        return res.status(400).json({
            success: false,
            message: 'Invalid staff ID. Expected a numeric ID.'
        });
    }
    console.log('[Backend Route] ✅ Valid numeric ID, setting req.numericId:', numericId);
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
router.get('/me', auth_middleware_1.authenticateJWT, staff_controller_1.getCurrentUserStaffDetails);
router.put('/me', auth_middleware_1.authenticateJWT, async (req, res) => {
    req.numericId = req.currentUser?.id;
    req.params.userId = String(req.currentUser?.id ?? '');
    return Promise.resolve().then(() => __importStar(require('../controllers/staff.controller'))).then(({ updateStaff }) => updateStaff(req, res));
});
router.post('/me/upload-photo', auth_middleware_1.authenticateJWT, (req, res, next) => {
    if (!req.currentUser) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    req.numericId = req.currentUser.id;
    req.params.id = String(req.currentUser.id);
    req.resolvedUserId = req.currentUser.id;
    return next();
}, staff_photo_controller_1.upload.single('profile_picture'), staff_photo_controller_1.uploadProfilePhoto);
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff:read'), staff_controller_1.getAllStaff);
router.get('/:id', auth_middleware_1.authenticateJWT, validateNumericId, async (req, res, next) => {
    const requestedId = req.numericId;
    const requesterUserId = req.currentUser?.id;
    if (!requesterUserId || requestedId === undefined) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }
    let isSelfAccess = requesterUserId === requestedId;
    if (!isSelfAccess) {
        try {
            const requesterStaff = await staff_model_1.default.findByUserId(requesterUserId);
            if (requesterStaff && requesterStaff.id === requestedId) {
                isSelfAccess = true;
            }
        }
        catch (err) {
            console.error('[Backend Route] Failed to resolve requester staff for self-access check:', err);
        }
    }
    if (isSelfAccess)
        return next();
    return (0, auth_middleware_1.checkPermission)('staff:read')(req, res, next);
}, staff_controller_1.getStaffById);
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.create'), staff_controller_1.createStaff);
router.put('/:userId', auth_middleware_1.authenticateJWT, validateNumericId, async (req, res) => {
    console.log('========================================');
    console.log('[Backend Route] PUT /staff/:userId handler called');
    console.log('[Backend Route] req.params.userId:', req.params.userId);
    console.log('[Backend Route] req.numericId:', req.numericId);
    console.log('[Backend Route] req.currentUser.id:', req.currentUser?.id);
    console.log('========================================');
    const requestedId = req.numericId;
    const requesterUserId = req.currentUser?.id;
    if (!requesterUserId) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }
    let isSelfUpdate = requesterUserId === requestedId;
    if (!isSelfUpdate) {
        try {
            const requesterStaff = await staff_model_1.default.findByUserId(requesterUserId);
            if (requesterStaff && requesterStaff.id === requestedId) {
                isSelfUpdate = true;
                console.log('[Backend Route] Self-update detected via staff.id (backward compatible)');
            }
        }
        catch (err) {
            console.error('[Backend Route] Failed to resolve requester staff for self-update check:', err);
        }
    }
    if (!isSelfUpdate) {
        console.log('[Backend Route] Cross-user update attempt (permission required)');
        return (0, auth_middleware_1.checkPermission)('staff.update')(req, res, () => {
            Promise.resolve().then(() => __importStar(require('../controllers/staff.controller'))).then(({ updateStaff }) => updateStaff(req, res));
        });
    }
    console.log('[Backend Route] Self-update allowed');
    return Promise.resolve().then(() => __importStar(require('../controllers/staff.controller'))).then(({ updateStaff }) => updateStaff(req, res));
});
router.delete('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.delete'), validateNumericId, staff_controller_1.deleteStaff);
router.patch('/:id/terminate', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.terminate'), validateNumericId, staff_controller_1.terminateStaff);
router.get('/department/:department', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff:read'), staff_controller_1.getStaffByDepartment);
router.get('/dynamic-fields', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff:read'), staff_controller_1.getDynamicFields);
router.post('/dynamic-fields', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.create'), staff_controller_1.createDynamicField);
router.put('/dynamic-fields/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.update'), validateNumericIdParam('id'), staff_controller_1.updateDynamicField);
router.delete('/dynamic-fields/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.delete'), validateNumericIdParam('id'), staff_controller_1.deleteDynamicField);
router.get('/dynamic-values/:staffId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff:read'), validateNumericIdParam('staffId'), staff_controller_1.getStaffDynamicValues);
router.post('/dynamic-values/:staffId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.update'), validateNumericIdParam('staffId'), staff_controller_1.setStaffDynamicValues);
const resolveProfilePhotoTargetUserId = async (req, res, next) => {
    if (!req.currentUser) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const rawId = req.numericId ?? parseInt(String(req.params.id ?? ''), 10);
    if (Number.isNaN(rawId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const isSuperAdmin = req.currentUser.role_id === 1;
    if (!isSuperAdmin) {
        req.resolvedUserId = req.currentUser.id;
        return next();
    }
    if (rawId === req.currentUser.id) {
        req.resolvedUserId = rawId;
        return next();
    }
    const idType = String(req.query.idType || req.query.id_type || '').toLowerCase();
    if (idType === 'staff') {
        const staff = await staff_model_1.default.findById(rawId);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff record not found for the provided staff ID' });
        }
        req.resolvedUserId = staff.user_id;
        return next();
    }
    if (idType === 'user') {
        const user = await user_model_1.default.findById(rawId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found for the provided user ID' });
        }
        req.resolvedUserId = rawId;
        return next();
    }
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
    req.resolvedUserId = staffByStaffId ? staffByStaffId.user_id : rawId;
    return next();
};
router.post('/:id/upload-photo', auth_middleware_1.authenticateJWT, validateNumericId, (req, res, next) => {
    if (!req.currentUser) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (req.currentUser.role_id !== 1)
        return next();
    return (0, auth_middleware_1.checkPermission)('staff.update')(req, res, next);
}, resolveProfilePhotoTargetUserId, staff_photo_controller_1.upload.single('profile_picture'), staff_photo_controller_1.uploadProfilePhoto);
exports.default = router;
//# sourceMappingURL=staff.route.js.map