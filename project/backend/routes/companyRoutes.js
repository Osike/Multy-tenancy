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
  body('contactPhone')
    .matches(/^[\+]?[1-9][\d\s\-\(\)]{0,19}$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Street address is required and cannot exceed 200 characters'),
  body('address.city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City is required and cannot exceed 100 characters'),
  body('address.state')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('State is required and cannot exceed 50 characters'),
  body('address.zipCode')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('ZIP code is required and cannot exceed 20 characters'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),
  body('businessRegistrationNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Business registration number cannot exceed 50 characters'),
  body('taxId')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tax ID cannot exceed 50 characters'),
  body('industry')
    .optional()
    .isIn(['Logistics', 'Transportation', 'Freight', 'Delivery', 'Moving', 'Other'])
    .withMessage('Invalid industry'),
  body('companySize')
    .optional()
    .isIn(['Small (1-10)', 'Medium (11-50)', 'Large (51-200)', 'Enterprise (200+)'])
    .withMessage('Invalid company size'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('subscription.plan')
    .optional()
    .isIn(['Basic', 'Professional', 'Enterprise'])
    .withMessage('Invalid subscription plan'),
  body('subscription.maxUsers')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max users must be between 1 and 1000'),
  body('subscription.maxTrucks')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max trucks must be between 1 and 10000'),
  body('subscription.endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid subscription end date'),
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