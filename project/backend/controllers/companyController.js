import Company from '../models/Company.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Get all companies (Super Admin only)
// @route   GET /api/companies
// @access  Private/Super Admin
export const getCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Search by company name
    if (req.query.search) {
      query.companyName = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const companies = await Company.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Company.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve companies',
      error: error.message,
    });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private/Super Admin
export const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { company },
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve company',
      error: error.message,
    });
  }
};

// @desc    Create new company
// @route   POST /api/companies
// @access  Private/Super Admin
export const createCompany = async (req, res) => {
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
      companyName,
      businessRegistrationNumber,
      taxId,
      contactEmail,
      contactPhone,
      address,
      industry,
      companySize,
      website,
      subscription
    } = req.body;

    // Create company with proper schema fields
    const company = await Company.create({
      companyName,
      businessRegistrationNumber,
      taxId,
      contactEmail,
      contactPhone,
      address: {
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        country: address?.country || 'USA'
      },
      industry: industry || 'Logistics',
      companySize: companySize || 'Small (1-10)',
      website,
      subscription: {
        plan: subscription?.plan || 'Basic',
        status: subscription?.status || 'Trial',
        startDate: new Date(),
        endDate: subscription?.endDate ? new Date(subscription.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        maxUsers: subscription?.maxUsers || 10,
        maxTrucks: subscription?.maxTrucks || 50
      }
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: { company },
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company',
      error: error.message,
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private/Super Admin
export const updateCompany = async (req, res) => {
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

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: { company },
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message,
    });
  }
};

// @desc    Delete company (and all associated data)
// @route   DELETE /api/companies/:id
// @access  Private/Super Admin
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Check if company has users
    const userCount = await User.countDocuments({ companyId: company._id });
    
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete company with ${userCount} active users. Please remove all users first.`,
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message,
    });
  }
};