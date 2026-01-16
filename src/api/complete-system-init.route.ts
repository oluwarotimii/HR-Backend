import { Router } from 'express';
import { 
  initializeCompleteSystem, 
  checkSystemReadiness 
} from '../controllers/complete-system-init.controller';

const router = Router();

// Check if system is ready for initialization
router.get('/readiness', checkSystemReadiness);

// Initialize the complete system (run migrations + create Super Admin)
router.post('/setup-complete', initializeCompleteSystem);

export default router;