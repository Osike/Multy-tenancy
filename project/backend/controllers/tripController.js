import Trip from '../models/Trip.js';
import Truck from '../models/Truck.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// Helper function to build query filters
const buildTripFilters = (req) => {
  const filters = { companyId: req.user.companyId };
  
  // Role-based filtering
  if (req.user.role === 'driver') {
    filters.assignedDriver = req.user._id;
  }
  
  // Query parameter filters
  if (req.query.truck) {
    filters.truck = req.query.truck;
  }
  
  if (req.query.customer) {
    filters.customer = req.query.customer;
  }
  
  if (req.query.status) {
    filters.status = req.query.status;
  }
  
  if (req.query.assignedDriver) {
    filters.assignedDriver = req.query.assignedDriver;
  }
  
  // Date range filtering
  if (req.query.startDate || req.query.endDate) {
    filters.tripStartDate = {};
    if (req.query.startDate) {
      filters.tripStartDate.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filters.tripStartDate.$lte = new Date(req.query.endDate);
    }
  }
  
  return filters;
};

// @desc    Get all trips for the company
// @route   GET /api/trips
// @access  Private (dispatcher, company_admin, driver)
export const getTrips = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filters = buildTripFilters(req);
    
    // Build sort options
    const sortOptions = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sortOptions[sortField] = sortOrder;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest first
    }

    const trips = await Trip.find(filters)
      .populate('truck', 'truckIdCode make model licensePlate')
      .populate('customer', 'customerName contactPerson')
      .populate('assignedDriver', 'fullName username')
      .populate('recordedBy', 'fullName username')
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .lean(); // Use lean() for better performance

    const total = await Trip.countDocuments(filters);
    
    // Calculate summary statistics for the filtered results
    const stats = await Trip.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$rate' },
          totalExpenses: { $sum: '$totalExpenses' },
          totalProfit: { $sum: '$netProfit' },
          avgFuelEfficiency: { $avg: '$fuelEfficiency' },
          totalMileage: { $sum: '$mileage' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        trips,
        summary: stats[0] || {
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          avgFuelEfficiency: 0,
          totalMileage: 0,
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trips',
      error: error.message,
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private (dispatcher, company_admin, assigned driver)
export const getTrip = async (req, res) => {
  try {
    const filters = { _id: req.params.id };
    
    // Add company filter for non-super_admin users
    if (req.user.role !== 'super_admin') {
      filters.companyId = req.user.companyId;
    }
    
    // Drivers can only see their assigned trips
    if (req.user.role === 'driver') {
      filters.assignedDriver = req.user._id;
    }

    const trip = await Trip.findOne(filters)
      .populate('truck', 'truckIdCode make model year licensePlate currentDriver')
      .populate('customer', 'customerName contactPerson contactEmail contactPhone')
      .populate('assignedDriver', 'fullName username email phoneNumber licenseNumber')
      .populate('recordedBy', 'fullName username')
      .populate({
        path: 'truck',
        populate: {
          path: 'currentDriver',
          select: 'fullName username'
        }
      });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { trip },
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trip',
      error: error.message,
    });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private (dispatcher, company_admin)
export const createTrip = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      truck,
      rate,
      fuelCostUsd,
      fuelLiters,
      mileage,
      driverSalary,
      maintenanceCost,
      roadTolls,
      routeDetails,
      customer,
      customerName,
      loadDetails,
      tripStartDate,
      tripEndDate,
      comments,
      assignedDriver,
      attachments,
    } = req.body;

    // Validate truck belongs to company
    const truckDoc = await Truck.findOne({ _id: truck, companyId: req.user.companyId });
    if (!truckDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid truck selection',
      });
    }

    // Validate assigned driver if provided
    if (assignedDriver) {
      const driverDoc = await User.findOne({ 
        _id: assignedDriver, 
        companyId: req.user.companyId, 
        role: 'driver',
        isActive: true 
      });
      if (!driverDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid driver assignment',
        });
      }
    }

    let customerId = customer;

    // Handle customer creation if new customer name is provided
    if (!customer && customerName) {
      // Check if customer already exists
      const existingCustomer = await Customer.findOne({
        customerName: customerName.trim(),
        companyId: req.user.companyId,
      });

      if (existingCustomer) {
        customerId = existingCustomer._id;
      } else {
        // Create new customer
        const newCustomer = await Customer.create({
          customerName: customerName.trim(),
          companyId: req.user.companyId,
        });
        customerId = newCustomer._id;
      }
    } else if (customer) {
      // Validate existing customer belongs to company
      const customerDoc = await Customer.findOne({ _id: customer, companyId: req.user.companyId });
      if (!customerDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer selection',
        });
      }
    }

    // Validate date range
    const startDate = new Date(tripStartDate);
    const endDate = new Date(tripEndDate);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Trip end date must be after start date',
      });
    }
    
    if (endDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Trip end date cannot be in the future',
      });
    }

    // Create trip
    const trip = await Trip.create({
      companyId: req.user.companyId,
      truck,
      rate: parseFloat(rate),
      fuelCostUsd: parseFloat(fuelCostUsd),
      fuelLiters: parseFloat(fuelLiters),
      mileage: parseFloat(mileage),
      driverSalary: parseFloat(driverSalary),
      maintenanceCost: parseFloat(maintenanceCost),
      roadTolls: parseFloat(roadTolls),
      routeDetails,
      customer: customerId,
      loadDetails: {
        weight: parseFloat(loadDetails.weight),
        goodsType: loadDetails.goodsType,
      },
      tripStartDate: startDate,
      tripEndDate: endDate,
      comments,
      assignedDriver: assignedDriver || undefined,
      attachments: attachments || [],
      recordedBy: req.user._id,
      status: assignedDriver ? 'Assigned' : 'Pending',
    });

    // Populate the created trip for response
    const populatedTrip = await Trip.findById(trip._id)
      .populate('truck', 'truckIdCode make model')
      .populate('customer', 'customerName')
      .populate('assignedDriver', 'fullName username')
      .populate('recordedBy', 'fullName username');

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: { trip: populatedTrip },
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trip',
      error: error.message,
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private (dispatcher, company_admin, assigned driver for status only)
export const updateTrip = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const filters = { _id: req.params.id };
    
    // Add company filter for non-super_admin users
    if (req.user.role !== 'super_admin') {
      filters.companyId = req.user.companyId;
    }
    
    // Drivers can only update their assigned trips
    if (req.user.role === 'driver') {
      filters.assignedDriver = req.user._id;
    }

    const trip = await Trip.findOne(filters);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Drivers can only update status and comments
    if (req.user.role === 'driver') {
      const allowedFields = ['status', 'comments'];
      const updateFields = Object.keys(req.body);
      const isValidUpdate = updateFields.every(field => allowedFields.includes(field));
      
      if (!isValidUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Drivers can only update trip status and comments',
        });
      }
    }

    // Validate status transitions
    if (req.body.status && req.body.status !== trip.status) {
      const validTransitions = {
        'Pending': ['Assigned', 'Cancelled'],
        'Assigned': ['In Transit', 'Cancelled'],
        'In Transit': ['Delivered', 'Cancelled'],
        'Delivered': [], // Final state
        'Cancelled': [] // Final state
      };
      
      if (!validTransitions[trip.status]?.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${trip.status} to ${req.body.status}`,
        });
      }
    }

    // Handle customer update/creation
    if (req.body.customerName && !req.body.customer) {
      const existingCustomer = await Customer.findOne({
        customerName: req.body.customerName.trim(),
        companyId: req.user.companyId,
      });

      if (existingCustomer) {
        req.body.customer = existingCustomer._id;
      } else {
        const newCustomer = await Customer.create({
          customerName: req.body.customerName.trim(),
          companyId: req.user.companyId,
        });
        req.body.customer = newCustomer._id;
      }
      delete req.body.customerName;
    }

    // Validate date changes
    if (req.body.tripStartDate || req.body.tripEndDate) {
      const startDate = new Date(req.body.tripStartDate || trip.tripStartDate);
      const endDate = new Date(req.body.tripEndDate || trip.tripEndDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'Trip end date must be after start date',
        });
      }
    }

    // Update trip
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('truck', 'truckIdCode make model')
      .populate('customer', 'customerName')
      .populate('assignedDriver', 'fullName username')
      .populate('recordedBy', 'fullName username');

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: { trip: updatedTrip },
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trip',
      error: error.message,
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (company_admin only)
export const deleteTrip = async (req, res) => {
  try {
    const filters = { _id: req.params.id };
    
    // Add company filter for non-super_admin users
    if (req.user.role !== 'super_admin') {
      filters.companyId = req.user.companyId;
    }
    
    const trip = await Trip.findOne(filters);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Prevent deletion of completed trips
    if (trip.status === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed trips',
      });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trip',
      error: error.message,
    });
  }
};

// @desc    Get trip statistics for company
// @route   GET /api/trips/stats
// @access  Private (company_admin, dispatcher)
export const getTripStats = async (req, res) => {
  try {
    const { startDate, endDate, truck, driver } = req.query;
    
    const statsFilter = { companyId: req.user.companyId };
    
    // Add date filters if provided
    if (startDate || endDate) {
      statsFilter.tripStartDate = {};
      if (startDate) {
        statsFilter.tripStartDate.$gte = new Date(startDate);
      }
      if (endDate) {
        statsFilter.tripStartDate.$lte = new Date(endDate);
      }
    }
    
    // Get overall statistics
    const stats = await Trip.aggregate([
      { $match: statsFilter },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalRevenue: { $sum: '$rate' },
          totalExpenses: { $sum: '$totalExpenses' },
          totalProfit: { $sum: '$netProfit' },
          avgFuelEfficiency: { $avg: '$fuelEfficiency' },
          totalMileage: { $sum: '$mileage' },
        }
      }
    ]);
    
    // Get status distribution
    const statusStats = await Trip.aggregate([
      { $match: statsFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get top performing trucks
    const truckStats = await Trip.aggregate([
      { $match: statsFilter },
      {
        $group: {
          _id: '$truck',
          totalTrips: { $sum: 1 },
          totalRevenue: { $sum: '$rate' },
          totalProfit: { $sum: '$netProfit' },
          avgFuelEfficiency: { $avg: '$fuelEfficiency' }
        }
      },
      { $sort: { totalProfit: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'trucks',
          localField: '_id',
          foreignField: '_id',
          as: 'truckInfo'
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTrips: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          avgFuelEfficiency: 0,
          totalMileage: 0,
        },
        statusDistribution: statusStats,
        topTrucks: truckStats,
      },
    });
  } catch (error) {
    console.error('Get trip stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trip statistics',
      error: error.message,
    });
  }
};