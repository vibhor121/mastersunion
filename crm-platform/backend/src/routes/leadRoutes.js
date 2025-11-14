import express from 'express';
import { body } from 'express-validator';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getLeadHistory,
} from '../controllers/leadController.js';
import { authenticate, authorize, authorizeLeadAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createLeadValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional(),
  body('company').optional(),
  body('position').optional(),
  body('source').optional(),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),
  body('notes').optional(),
  body('ownerId').optional().isUUID().withMessage('Invalid owner ID'),
];

const updateLeadValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional(),
  body('company').optional(),
  body('position').optional(),
  body('status')
    .optional()
    .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'INACTIVE'])
    .withMessage('Invalid status'),
  body('source').optional(),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),
  body('notes').optional(),
  body('ownerId').optional().isUUID().withMessage('Invalid owner ID'),
];

// Routes
router.get('/', authenticate, getLeads);
router.get('/:id', authenticate, getLead);
router.post('/', authenticate, createLeadValidation, validate, createLead);
router.put('/:id', authenticate, updateLeadValidation, validate, updateLead);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteLead);
router.get('/:id/history', authenticate, getLeadHistory);

export default router;

