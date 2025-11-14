import express from 'express';
import {
  getDashboardStats,
  getLeadsByStatus,
  getLeadsByPriority,
  getLeadsTimeline,
  getTopPerformers,
  getActivityStats,
} from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.get('/stats', authenticate, getDashboardStats);
router.get('/leads-by-status', authenticate, getLeadsByStatus);
router.get('/leads-by-priority', authenticate, getLeadsByPriority);
router.get('/leads-timeline', authenticate, getLeadsTimeline);
router.get('/top-performers', authenticate, authorize('ADMIN', 'MANAGER'), getTopPerformers);
router.get('/activity-stats', authenticate, getActivityStats);

export default router;

