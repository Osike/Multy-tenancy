import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';

// Rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More strict rate limiting for failed login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 failed login attempts per windowMs
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many failed login attempts, please try again later.',
  },
});
// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    // Check token blacklist (implement Redis for production)
    // if (await isTokenBlacklisted(token)) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Token has been revoked',
    //   });
    // }
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user and attach to request
    const user = await User.findById(decoded.userId)
      .select('-password -passwordResetToken -passwordResetExpires')
      .populate('companyId', 'companyName status subscriptionPlan');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token is invalid',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    // Check if company is still active (for non-super_admin users)
    if (user.role !== 'super_admin' && user.companyId) {
      if (!user.companyId || user.companyId.status !== 'Active') {
        return res.status(401).json({
          success: false,
          message: 'Company account is inactive',
        });
      }
    }

    // Attach user info to request
    req.user = {
      _id: user._id,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      company: user.companyId,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Middleware to authorize specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Middleware to ensure data isolation (multi-tenancy)
export const ensureCompanyAccess = (req, res, next) => {
  // Skip company check for super_admin
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Ensure user has a company ID
  if (!req.user.companyId) {
    return res.status(403).json({
      success: false,
      message: 'Company association required',
    });
  }

  next();
};

// Middleware to add company filter to queries automatically
export const addCompanyFilter = (req, res, next) => {
  // Skip for super_admin
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Add companyId to query filters
  req.companyFilter = { companyId: req.user.companyId };
  
  next();
};

// Middleware to validate resource ownership
export const validateResourceOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      // Skip for super_admin
      if (req.user.role === 'super_admin') {
        return next();
      }

      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Check if resource belongs to user's company
      if (resource.companyId.toString() !== req.user.companyId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource',
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource ownership validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate resource ownership',
      });
    }
  };
};
// Generate JWT token
export const generateToken = (userId, options = {}) => {
  const payload = { 
    userId,
    iat: Math.floor(Date.now() / 1000),
    ...options
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'tdms-api',
      audience: 'tdms-client'
    }
  );
}