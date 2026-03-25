import { Router } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import { SystemInitService } from '../services/system-init.service';
const router = Router();
router.get('/init-data', authenticateJWT, async (req, res) => {
    try {
        const systemData = await SystemInitService.getSystemData();
        return res.json({
            success: true,
            message: 'System initialization data retrieved successfully',
            data: systemData
        });
    }
    catch (error) {
        console.error('Get system init data error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve system data'
        });
    }
});
router.get('/init-data/stats', authenticateJWT, checkPermission('admin.access'), async (req, res) => {
    try {
        const stats = await SystemInitService.getCacheStats();
        return res.json({
            success: true,
            message: 'Cache statistics retrieved successfully',
            data: stats
        });
    }
    catch (error) {
        console.error('Get cache stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve cache statistics'
        });
    }
});
router.post('/init-data/refresh', authenticateJWT, checkPermission('admin.access'), async (req, res) => {
    try {
        await SystemInitService.refreshAll();
        return res.json({
            success: true,
            message: 'System cache refreshed successfully'
        });
    }
    catch (error) {
        console.error('Refresh system cache error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to refresh system cache'
        });
    }
});
router.post('/init-data/refresh/:type', authenticateJWT, checkPermission('admin.access'), async (req, res) => {
    try {
        const typeParam = req.params.type;
        const type = Array.isArray(typeParam) ? typeParam[0] : typeParam;
        const validTypes = ['roles', 'permissions', 'branches', 'departments', 'leaveTypes', 'holidays'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
            });
        }
        await SystemInitService.refresh(type);
        return res.json({
            success: true,
            message: `${type} cache refreshed successfully`
        });
    }
    catch (error) {
        console.error('Refresh specific cache error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to refresh cache'
        });
    }
});
export default router;
//# sourceMappingURL=system.route.js.map