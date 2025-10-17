// routes/adminRoutes.js
import express from 'express';
import { 
  getAssignmentStats, 
  resetAssignmentCounts, 
  getActiveSalesExecutives,
  forceRefreshAssignment,
  setNextUser
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes - only accessible to admins
router.use(authenticate);
router.use(authorize(['Super Admin', 'Team Member']));

router.get('/assignment-stats', getAssignmentStats);
router.post('/assignment-reset', resetAssignmentCounts);
router.get('/sales-executives', getActiveSalesExecutives);
router.post('/refresh-assignment', forceRefreshAssignment);
router.post('/set-next-user', setNextUser);

export default router;