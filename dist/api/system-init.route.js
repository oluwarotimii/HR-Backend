import { Router } from 'express';
import { initializeSystem, checkInitializationStatus } from '../controllers/system-init.controller';
import { isSystemInitialized } from '../controllers/system-init.controller';
const router = Router();
const requireUninitializedSystem = async (req, res, next) => {
    try {
        const systemInitialized = await isSystemInitialized();
        if (systemInitialized) {
            return res.status(400).json({
                success: false,
                message: 'System is already initialized'
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking system status'
        });
    }
};
router.post('/initialize', requireUninitializedSystem, initializeSystem);
router.get('/status', checkInitializationStatus);
export default router;
//# sourceMappingURL=system-init.route.js.map