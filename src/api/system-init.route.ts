import { Router } from 'express';
import { initializeSystem, checkInitializationStatus } from '../controllers/system-init.controller';
import { isSystemInitialized } from '../controllers/system-init.controller';

const router = Router();

// Middleware to check if system is already initialized
const requireUninitializedSystem = async (req: any, res: any, next: any) => {
  try {
    const systemInitialized = await isSystemInitialized();
    if (systemInitialized) {
      return res.status(400).json({
        success: false,
        message: 'System is already initialized'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking system status'
    });
  }
};

// Initialize the system with a Super Admin
router.post('/initialize', requireUninitializedSystem, initializeSystem);

// Check if system is initialized
router.get('/status', checkInitializationStatus);

export default router;