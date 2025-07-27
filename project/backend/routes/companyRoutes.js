import express from 'express';
import { body } from 'express-validator';
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware for company operations
const companyValidation = [
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('contactEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('subscriptionPlan')
    .optional()
    .isIn(['Basic', 'Premium', 'Enterprise'])
    .withMessage('Invalid subscription plan'),
  body('maxUsers')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max users must be between 1 and 1000'),
  body('maxTrucks')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max trucks must be between 1 and 10000'),
];

// All routes require authentication and super_admin role
router.use(authenticateToken);
router.use(authorizeRoles('super_admin'));

// Routes
router.route('/')
  .get(getCompanies)
  .post(companyValidation, createCompany);

router.route('/:id')
  .get(getCompany)
  .put(companyValidation, updateCompany)
  .delete(deleteCompany);

export default router;