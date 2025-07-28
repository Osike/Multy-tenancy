import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // ADDED: Missing crypto import

const userSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: function() {
      return this.role !== 'super_admin';
    },
    index: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['super_admin', 'company_admin', 'dispatcher', 'driver'],
      message: 'Role must be one of: super_admin, company_admin, dispatcher, driver',
    },
    required: [true, 'User role is required'],
    index: true,
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters'],
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number'],
  },
  licenseNumber: {
    type: String,
    trim: true,
    // Only required for drivers
    required: function() {
      return this.role === 'driver';
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // UPDATED: Added profile picture field
  profilePicture: {
    type: String,
    trim: true,
  },
  // UPDATED: Added user preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    dashboard: {
      layout: {
        type: String,
        enum: ['grid', 'list'],
        default: 'grid'
      }
    }
  },
  // UPDATED: Added driver-specific fields
  driverInfo: {
    licenseClass: {
      type: String,
      required: function() {
        return this.role === 'driver';
      }
    },
    licenseExpiryDate: {
      type: Date,
      required: function() {
        return this.role === 'driver';
      }
    },
    medicalCertExpiry: {
      type: Date,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'USA'
      }
    }
  },
  // UPDATED: Added permission tracking
  permissions: {
    type: [String],
    default: function() {
      // Set default permissions based on role
      switch(this.role) {
        case 'super_admin':
          return ['all'];
        case 'company_admin':
          return ['manage_users', 'manage_trucks', 'manage_trips', 'view_analytics'];
        case 'dispatcher':
          return ['manage_trips', 'view_trucks', 'view_drivers'];
        case 'driver':
          return ['view_assigned_trips', 'update_trip_status'];
        default:
          return [];
      }
    }
  },
  // UPDATED: Added session tracking
  sessions: [{
    token: String,
    device: String,
    ipAddress: String,
    lastActive: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // UPDATED: Added account security fields
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    passwordChangedAt: Date
  }
}, {
  timestamps: true,
});

// UPDATED: Fixed duplicate index warning by removing redundant email index
// Compound index for company-specific username uniqueness
userSchema.index({ companyId: 1, username: 1 }, { unique: true });
// userSchema.index({ email: 1 }, { unique: true }); // REMOVED - email already has unique: true
userSchema.index({ companyId: 1, role: 1 });
// UPDATED: Added additional performance indexes
userSchema.index({ isActive: 1 });
userSchema.index({ lastLogin: 1 });
userSchema.index({ 'security.lockUntil': 1 });

// UPDATED: Enhanced pre-save middleware to hash password and track changes
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  try {
    // Hash the password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // UPDATED: Track when password was changed
    this.security.passwordChangedAt = new Date();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// UPDATED: Added method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin' || this.permissions.includes('all')) {
    return true;
  }
  return this.permissions.includes(permission);
};

// UPDATED: Added method to check if user is locked
userSchema.methods.isLocked = function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
};

// UPDATED: Added method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// UPDATED: Added method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      'security.loginAttempts': 1,
      'security.lockUntil': 1
    }
  });
};

// UPDATED: Added method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find users by company
userSchema.statics.findByCompany = function(companyId) {
  return this.find({ companyId }).select('-password');
};

// UPDATED: Added static method to find active users by company
userSchema.statics.findActiveByCompany = function(companyId) {
  return this.find({ companyId, isActive: true }).select('-password');
};

// UPDATED: Added static method to find users by role
userSchema.statics.findByRole = function(role, companyId = null) {
  const query = { role };
  if (companyId) query.companyId = companyId;
  return this.find(query).select('-password');
};

// Virtual for user's company information
userSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
});

// UPDATED: Added virtual for full driver info (only for drivers)
userSchema.virtual('isDriver').get(function() {
  return this.role === 'driver';
});

// UPDATED: Added virtual for checking if license is expiring soon (within 30 days)
userSchema.virtual('licenseExpiringSoon').get(function() {
  if (this.role !== 'driver' || !this.driverInfo?.licenseExpiryDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.driverInfo.licenseExpiryDate <= thirtyDaysFromNow;
});

// UPDATED: Added virtual for user display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.username;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;