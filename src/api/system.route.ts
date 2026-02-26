import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import { SystemInitService } from '../services/system-init.service';

const router = Router();

/**
 * GET /api/system/init-data
 * Get all cached system initialization data
 * This is used by frontend to load static data on app startup
 */
router.get('/init-data', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const systemData = await SystemInitService.getSystemData();
    
    return res.json({
      success: true,
      message: 'System initialization data retrieved successfully',
      data: systemData
    });
  } catch (error) {
    console.error('Get system init data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system data'
    });
  }
});

/**
 * GET /api/system/init-data/stats
 * Get cache statistics
 */
router.get('/init-data/stats', authenticateJWT, checkPermission('admin.access'), async (req: Request, res: Response) => {
  try {
    const stats = await SystemInitService.getCacheStats();
    
    return res.json({
      success: true,
      message: 'Cache statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Get cache stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache statistics'
    });
  }
});

/**
 * POST /api/system/init-data/refresh
 * Refresh all cached system data
 * Requires admin permission
 */
router.post('/init-data/refresh', authenticateJWT, checkPermission('admin.access'), async (req: Request, res: Response) => {
  try {
    await SystemInitService.refreshAll();
    
    return res.json({
      success: true,
      message: 'System cache refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh system cache error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh system cache'
    });
  }
});

/**
 * POST /api/system/init-data/refresh/:type
 * Refresh specific cached data type
 * Requires admin permission
 */
router.post('/init-data/refresh/:type', authenticateJWT, checkPermission('admin.access'), async (req: Request, res: Response) => {
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
    
    await SystemInitService.refresh(type as any);
    
    return res.json({
      success: true,
      message: `${type} cache refreshed successfully`
    });
  } catch (error) {
    console.error('Refresh specific cache error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh cache'
    });
  }
});

export default router;
