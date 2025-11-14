import express from 'express';
import { body } from 'express-validator';
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getUpcomingActivities,
} from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const activityValidation = [
  body('type')
    .isIn(['NOTE', 'CALL', 'MEETING', 'EMAIL', 'TASK', 'STATUS_CHANGE'])
    .withMessage('Invalid activity type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('outcome').optional(),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number'),
  body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),
  body('completedAt').optional().isISO8601().withMessage('Invalid date format'),
];

const updateActivityValidation = [
  body('type')
    .optional()
    .isIn(['NOTE', 'CALL', 'MEETING', 'EMAIL', 'TASK', 'STATUS_CHANGE'])
    .withMessage('Invalid activity type'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional(),
  body('outcome').optional(),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number'),
  body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),
  body('completedAt').optional().isISO8601().withMessage('Invalid date format'),
];

// Routes
router.get('/upcoming', authenticate, getUpcomingActivities);
router.get('/:id', authenticate, getActivity);
router.put('/:id', authenticate, updateActivityValidation, validate, updateActivity);
router.delete('/:id', authenticate, deleteActivity);

export default router;

