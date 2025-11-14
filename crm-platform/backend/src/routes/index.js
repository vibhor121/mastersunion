import express from 'express';
import authRoutes from './authRoutes.js';
import leadRoutes from './leadRoutes.js';
import activityRoutes from './activityRoutes.js';
import leadActivityRoutes from './leadActivityRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

// API version 1 routes
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/leads/:leadId/activities', leadActivityRoutes);
router.use('/activities', activityRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CRM API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

