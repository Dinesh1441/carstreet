// routes/adminRoutes.js
import express from 'express';
import { 
  getAssignmentStats, 
  resetAssignmentCounts, 
  getActiveSalesExecutives,
  forceRefreshAssignment,
  setNextUser
} from '../controllers/adminController.js';
import { authenticate, authorize, userAuth } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes - only accessible to admins
router.use(authenticate);
router.use(authorize(['Super Admin']));

router.get('/assignment-stats', userAuth,  getAssignmentStats);
router.post('/assignment-reset', userAuth, resetAssignmentCounts);
router.get('/sales-executives', userAuth, getActiveSalesExecutives);
router.post('/refresh-assignment', userAuth, forceRefreshAssignment);
router.post('/set-next-user', userAuth, setNextUser);

export default router;