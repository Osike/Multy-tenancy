import express from 'express';
import { body } from 'express-validator';
import { 
  authenticateToken, 
  authorizeRoles, 
  validateResourceOwnership 
} from '../middleware/auth.js';
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStats
} from '../controllers/tripController.js';

const router = express.Router();

// Validation for trip creation
const tripValidation = [
  body('tripId')
    .isLength({ min: 1, max: 50 })
    .withMessage('Trip ID is required and must be less than 50 characters'),
  body('truck')
    .isMongoId()
    .withMessage('Valid truck ID is required'),
  body('driver')
    .isMongoId()
    .withMessage('Valid driver ID is required'),
  body('tripDate')
    .isISO8601()
    .withMessage('Valid trip date is required'),
  body('fromLocation')
    .isLength({ min: 1, max: 200 })
    .withMessage('From location is required and must be less than 200 characters'),
  body('toLocation')
    .isLength({ min: 1, max: 200 })
    .withMessage('To location is required and must be less than 200 characters'),
  body('cargoDetails.goodsType')
    .isLength({ min: 1, max: 100 })
    .withMessage('Goods type is required and must be less than 100 characters'),
  body('cargoDetails.weight')
    .isFloat({ min: 0, max: 200000 })
    .withMessage('Weight must be between 0 and 200,000'),
  body('cargoDetails.weightUnit')
    .optional()
    .isIn(['lbs', 'kg', 'tons'])
    .withMessage('Weight unit must be lbs, kg, or tons'),
  body('cargoDetails.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('cargoDetails.specialRequirements')
    .optional()
    .isArray()
    .withMessage('Special requirements must be an array'),
  body('customer')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('rate')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Rate must be between 0 and 1,000,000'),
  body('currency')
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Currency must be USD, EUR, GBP, CAD, or AUD'),
  body('fuelCost')
    .optional()
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Fuel cost must be between 0 and 100,000'),
  body('mileageCost')
    .optional()
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Mileage cost must be between 0 and 50,000'),
  body('driverSalary')
    .optional()
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Driver salary must be between 0 and 50,000'),
  body('roadTolls')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Road tolls must be between 0 and 10,000'),
  body('maintenanceExpenses')
    .optional()
    .isArray()
    .withMessage('Maintenance expenses must be an array'),
  body('maintenanceExpenses.*.itemService')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Item/Service is required and must be less than 100 characters'),
  body('maintenanceExpenses.*.cost')
    .optional()
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Cost must be between 0 and 50,000'),
  body('maintenanceExpenses.*.serviceProvider')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Service provider is required and must be less than 100 characters'),
  body('maintenanceExpenses.*.date')
    .optional()
    .isISO8601()
    .withMessage('Valid date is required'),
  body('maintenanceExpenses.*.notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('comments')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Comments cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid status value'),
];

// Validation for trip updates (more lenient)
const tripUpdateValidation = [
  body('tripId')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Trip ID must be less than 50 characters'),
  body('truck')
    .optional()
    .isMongoId()
    .withMessage('Valid truck ID is required'),
  body('driver')
    .optional()
    .isMongoId()
    .withMessage('Valid driver ID is required'),
  body('rate')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Rate must be between 0 and 1,000,000'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Currency must be USD, EUR, GBP, CAD, or AUD'),
  body('status')
    .optional()
    .isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid status value'),
  body('comments')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Comments cannot exceed 2000 characters'),
];

// Statistics route (before parameterized routes)
router.get('/stats', 
  authenticateToken,
  authorizeRoles('company_admin', 'dispatcher'), 
  getTripStats
);

// Main CRUD routes
router.route('/')
  .get(
    authenticateToken, 
    authorizeRoles('dispatcher', 'company_admin', 'driver'), 
    getTrips
  )
  .post(
    authenticateToken,
    authorizeRoles('dispatcher', 'company_admin'), 
    tripValidation, 
    createTrip
  );

router.route('/:id')
  .get(
    authenticateToken,
    authorizeRoles('dispatcher', 'company_admin', 'driver'),
    validateResourceOwnership('Trip'),
    getTrip
  )
  .put(
    authenticateToken,
    authorizeRoles('dispatcher', 'company_admin', 'driver'), 
    validateResourceOwnership('Trip'),
    tripUpdateValidation, 
    updateTrip
  )
  .delete(
    authenticateToken,
    authorizeRoles('dispatcher', 'company_admin'),
    validateResourceOwnership('Trip'),
    deleteTrip
  );

export default router;