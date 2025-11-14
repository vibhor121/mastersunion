import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getSalesExecutives,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role')
    .isIn(['ADMIN', 'MANAGER', 'SALES_EXECUTIVE'])
    .withMessage('Invalid role'),
];

const updateUserValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'SALES_EXECUTIVE'])
    .withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Routes
router.get('/sales-executives', authenticate, authorize('ADMIN', 'MANAGER'), getSalesExecutives);
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), getUsers);
router.get('/:id', authenticate, getUser);
router.post('/', authenticate, authorize('ADMIN'), createUserValidation, validate, createUser);
router.put('/:id', authenticate, updateUserValidation, validate, updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;

