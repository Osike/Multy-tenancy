import User from '../models/User.js';
import Company from '../models/Company.js';
import { generateToken } from '../middleware/auth.js';
import { validationResult } from 'express-validator';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (but controlled by role-based logic)
export const register = async (req, res) => {
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
      companyId,
      username,
      email,
      password,
      role,
      fullName,
      phoneNumber,
      licenseNumber,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // For non-super_admin users, validate company exists
    if (role !== 'super_admin') {
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required for non-super admin users',
        });
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID',
        });
      }

      if (company.subscription.status !== 'Active' && company.subscription.status !== 'Trial') {
        return res.status(400).json({
          success: false,
          message: 'Cannot register user for inactive company',
        });
      }

      // Check for duplicate username within the same company
      const existingUsername = await User.findOne({ companyId, username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists in this company',
        });
      }

      // Check company user limit
      const userCount = await User.countDocuments({ companyId });
      if (userCount >= company.maxUsers) {
        return res.status(400).json({
          success: false,
          message: `Company has reached maximum user limit of ${company.maxUsers}`,
        });
      }
    }

    // Create user data
    const userData = {
      username,
      email,
      password,
      role,
      fullName,
      phoneNumber,
    };

    // Add companyId for non-super_admin users
    if (role !== 'super_admin') {
      userData.companyId = companyId;
    }

    // Add licenseNumber for drivers
    if (role === 'driver' && licenseNumber) {
      userData.licenseNumber = licenseNumber;
    }

    // Create user
    const user = await User.create(userData);

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
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

    const { email, password } = req.body;

    // Check if user exists and select password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: ' password', // done this just for testing purposes
      });
    }

    // For non-super_admin users, check if company is still active
    if (user.role !== 'super_admin' && user.companyId) {
      const company = await Company.findById(user.companyId);
      if (!company || (company.subscription.status !== 'Active' && company.subscription.status !== 'Trial')) {
        return res.status(401).json({
          success: false,
          message: 'Company account is inactive. Please contact administrator.',
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('companyId', 'companyName');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('companyId', 'companyName status subscriptionPlan');

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message,
    });
  }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};