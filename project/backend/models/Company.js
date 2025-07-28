import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters'],
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number'],
  },
  registrationNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active',
  },
  subscriptionPlan: {
    type: String,
    enum: ['Basic', 'Premium', 'Enterprise'],
    default: 'Basic',
  },
  maxUsers: {
    type: Number,
    default: 10,
    min: [1, 'Company must allow at least 1 user'],
  },
  maxTrucks: {
    type: Number,
    default: 50,
    min: [1, 'Company must allow at least 1 truck'],
  },
  // UPDATED: Added features field for multi-tenant feature management
  features: {
    type: [String],
    default: ['trip_management', 'analytics', 'customer_management'],
    enum: [
      'trip_management',
      'analytics', 
      'customer_management',
      'fleet_tracking',
      'driver_management',
      'maintenance_tracking',
      'reports_export',
      'api_access'
    ]
  },
  // UPDATED: Added company logo field
  logoUrl: {
    type: String,
    trim: true,
  },
  // UPDATED: Added company settings
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  // UPDATED: Added subscription details
  subscription: {
    planId: {
      type: String,
      default: 'basic'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
});

// UPDATED: Removed duplicate companyName index since unique: true already creates one
// companySchema.index({ companyName: 1 }); // REMOVED - This was causing the duplicate warning

// UPDATED: Keep only the status index and add compound indexes for better performance
companySchema.index({ status: 1 });
companySchema.index({ status: 1, subscriptionPlan: 1 }); // ADDED: Compound index for filtering
companySchema.index({ 'subscription.isActive': 1 }); // ADDED: Index for active subscriptions

// Virtual for getting company users count
companySchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'companyId',
  count: true,
});

// Virtual for getting company trucks count
companySchema.virtual('truckCount', {
  ref: 'Truck',
  localField: '_id',
  foreignField: 'companyId',
  count: true,
});

// UPDATED: Added virtual for active users count
companySchema.virtual('activeUserCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'companyId',
  count: true,
  match: { isActive: true }
});

// UPDATED: Added virtual for subscription status
companySchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription.isActive) return 'inactive';
  if (new Date() > this.subscription.endDate) return 'expired';
  return 'active';
});

// UPDATED: Added method to check if company has specific feature
companySchema.methods.hasFeature = function(featureName) {
  return this.features.includes(featureName);
};

// UPDATED: Added method to check if company is within user limit
companySchema.methods.canAddUsers = function(additionalUsers = 1) {
  // This would need to be populated or calculated separately
  return true; // Placeholder - implement actual logic based on current user count
};

// UPDATED: Added method to check if company is within truck limit
companySchema.methods.canAddTrucks = function(additionalTrucks = 1) {
  // This would need to be populated or calculated separately
  return true; // Placeholder - implement actual logic based on current truck count
};

// UPDATED: Pre-save middleware to ensure subscription dates are valid
companySchema.pre('save', function(next) {
  if (this.subscription.startDate > this.subscription.endDate) {
    const error = new Error('Subscription start date cannot be after end date');
    return next(error);
  }
  next();
});

// Ensure virtual fields are serialized
companySchema.set('toJSON', { virtuals: true });
companySchema.set('toObject', { virtuals: true });

const Company = mongoose.model('Company', companySchema);

export default Company;