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
  body('truck')
    .isMongoId()
    .withMessage('Valid truck ID is required'),
  body('rate')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Rate must be between 0 and 1,000,000'),
  body('fuelCostUsd')
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Fuel cost must be between 0 and 100,000'),
  body('fuelLiters')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Fuel liters must be between 0 and 10,000'),
  body('mileage')
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Mileage must be between 0 and 100,000'),
  body('driverSalary')
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Driver salary must be between 0 and 50,000'),
  body('maintenanceCost')
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Maintenance cost must be between 0 and 50,000'),
  body('roadTolls')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Road tolls must be between 0 and 10,000'),
  body('routeDetails.startLocation')
    .isLength({ min: 1, max: 200 })
    .withMessage('Start location is required and must be less than 200 characters'),
  body('routeDetails.endLocation')
    .isLength({ min: 1, max: 200 })
    .withMessage('End location is required and must be less than 200 characters'),
  body('loadDetails.weight')
    .isFloat({ min: 0, max: 200000 })
    .withMessage('Load weight must be between 0 and 200,000 lbs'),
  body('loadDetails.goodsType')
    .isLength({ min: 1, max: 100 })
    .withMessage('Goods type is required and must be less than 100 characters'),
  body('tripStartDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('tripEndDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters'),
  body('assignedDriver')
    .optional()
    .isMongoId()
    .withMessage('Valid driver ID is required'),
];

// Validation for trip updates (more lenient)
const tripUpdateValidation = [
  body('truck')
    .optional()
    .isMongoId()
    .withMessage('Valid truck ID is required'),
  body('rate')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Rate must be between 0 and 1,000,000'),
  body('status')
    .optional()
    .isIn(['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'])
    .withMessage('Invalid status value'),
  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters'),
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