import express from 'express';
import { body } from 'express-validator';
import { getActivities, createActivity } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

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

// Routes for /api/v1/leads/:leadId/activities
router.get('/', authenticate, getActivities);
router.post('/', authenticate, activityValidation, validate, createActivity);

export default router;

