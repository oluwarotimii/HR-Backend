import { Router } from 'express';
import { initializeCompleteSystem, checkSystemReadiness } from '../controllers/complete-system-init.controller';
const router = Router();
router.get('/readiness', checkSystemReadiness);
router.post('/setup-complete', initializeCompleteSystem);
export default router;
//# sourceMappingURL=complete-system-init.route.js.map