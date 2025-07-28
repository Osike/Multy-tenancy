import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
    // removed line  index: true
  },
  businessRegistrationNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Business registration number cannot exceed 50 characters'],
    sparse: true, // Allows multiple null values
  },
  taxId: {
    type: String,
    trim: true,
    maxlength: [50, 'Tax ID cannot exceed 50 characters'],
    sparse: true,
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    },
    maxlength: [100, 'Email cannot exceed 100 characters'],
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(phone) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please provide a valid phone number'
    },
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters'],
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: [20, 'ZIP code cannot exceed 20 characters'],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters'],
      default: 'USA',
    },
  },
  industry: {
    type: String,
    enum: ['Logistics', 'Transportation', 'Freight', 'Delivery', 'Moving', 'Other'],
    default: 'Logistics',
  },
  companySize: {
    type: String,
    enum: ['Small (1-10)', 'Medium (11-50)', 'Large (51-200)', 'Enterprise (200+)'],
    default: 'Small (1-10)',
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true; // Optional field
        return /^https?:\/\/.+\..+/.test(url);
      },
      message: 'Please provide a valid website URL'
    },
    maxlength: [200, 'Website URL cannot exceed 200 characters'],
  },
  logo: {
    fileName: {
      type: String,
      maxlength: [255, 'Logo file name cannot exceed 255 characters'],
    },
    filePath: {
      type: String,
      maxlength: [500, 'Logo file path cannot exceed 500 characters'],
    },
    uploadedAt: {
      type: Date,
    },
  },
  subscription: {
    plan: {
      type: String,
      enum: ['Basic', 'Professional', 'Enterprise'],
      default: 'Basic',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Cancelled', 'Trial'],
      default: 'Trial',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(date) {
          return date > this.subscription.startDate;
        },
        message: 'Subscription end date must be after start date'
      }
    },
    maxUsers: {
      type: Number,
      default: 5,
      min: [1, 'Maximum users must be at least 1'],
      max: [1000, 'Maximum users cannot exceed 1000'],
    },
    maxTrucks: {
      type: Number,
      default: 10,
      min: [1, 'Maximum trucks must be at least 1'],
      max: [10000, 'Maximum trucks cannot exceed 10000'],
    },
    features: [{
      type: String,
      enum: [
        'Trip Management',
        'Driver Management', 
        'Truck Management',
        'Customer Management',
        'Financial Reports',
        'Advanced Analytics',
        'API Access',
        'White Label',
        'Priority Support'
      ]
    }]
  },
  settings: {
    timezone: {
      type: String,
      default: 'America/New_York',
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'CAD', 'EUR', 'GBP'],
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
    },
    measurementUnit: {
      type: String,
      default: 'Imperial',
      enum: ['Imperial', 'Metric'],
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
  },
  billingInfo: {
    billingEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(email) {
          if (!email) return true; // Optional field
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid billing email address'
      },
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Bank Transfer', 'PayPal', 'Invoice'],
    },
    lastPaymentDate: {
      type: Date,
    },
    nextBillingDate: {
      type: Date,
    },
  },
  stats: {
    totalUsers: {
      type: Number,
      default: 0,
    },
    totalTrucks: {
      type: Number,
      default: 0,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
companySchema.index({ companyName: 1 });
companySchema.index({ contactEmail: 1 }, { unique: true });
companySchema.index({ 'subscription.status': 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ createdAt: -1 });

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.state) parts.push(this.address.state);
  if (this.address.zipCode) parts.push(this.address.zipCode);
  if (this.address.country && this.address.country !== 'USA') parts.push(this.address.country);
  
  return parts.join(', ');
});

// Virtual for subscription status
companySchema.virtual('subscriptionStatus').get(function() {
  const now = new Date();
  
  if (this.subscription.endDate < now) {
    return 'Expired';
  }
  
  const daysUntilExpiry = Math.ceil((this.subscription.endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 7) {
    return 'Expiring Soon';
  }
  
  return this.subscription.status;
});

// Virtual for usage percentage
companySchema.virtual('usageStats').get(function() {
  return {
    userUsage: this.subscription.maxUsers > 0 ? 
      Math.round((this.stats.totalUsers / this.subscription.maxUsers) * 100) : 0,
    truckUsage: this.subscription.maxTrucks > 0 ? 
      Math.round((this.stats.totalTrucks / this.subscription.maxTrucks) * 100) : 0,
  };
});

// Pre-save middleware
companySchema.pre('save', function(next) {
  // Set default billing email to contact email if not provided
  if (!this.billingInfo.billingEmail) {
    this.billingInfo.billingEmail = this.contactEmail;
  }
  
  // Update last activity date
  this.stats.lastActivityDate = new Date();
  
  next();
});

// Static method to get active companies
companySchema.statics.getActiveCompanies = function() {
  return this.find({
    isActive: true,
    'subscription.status': 'Active'
  }).select('companyName contactEmail subscription.plan stats');
};

// Static method to get companies needing renewal
companySchema.statics.getCompaniesNeedingRenewal = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    isActive: true,
    'subscription.endDate': { $lte: futureDate },
    'subscription.status': { $in: ['Active', 'Trial'] }
  }).select('companyName contactEmail subscription.endDate subscription.plan');
};

// Instance method to check if company can add more users
companySchema.methods.canAddUsers = function(count = 1) {
  return (this.stats.totalUsers + count) <= this.subscription.maxUsers;
};

// Instance method to check if company can add more trucks
companySchema.methods.canAddTrucks = function(count = 1) {
  return (this.stats.totalTrucks + count) <= this.subscription.maxTrucks;
};

// Instance method to update usage stats
companySchema.methods.updateStats = async function() {
  const User = mongoose.model('User');
  const Truck = mongoose.model('Truck');
  const Trip = mongoose.model('Trip');
  
  const [userCount, truckCount, tripStats] = await Promise.all([
    User.countDocuments({ companyId: this._id, isActive: true }),
    Truck.countDocuments({ companyId: this._id, isActive: true }),
    Trip.aggregate([
      { $match: { companyId: this._id } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalRevenue: { $sum: '$rate' }
        }
      }
    ])
  ]);
  
  this.stats.totalUsers = userCount;
  this.stats.totalTrucks = truckCount;
  this.stats.totalTrips = tripStats[0]?.totalTrips || 0;
  this.stats.totalRevenue = tripStats[0]?.totalRevenue || 0;
  
  return this.save();
};

// Ensure virtual fields are serialized
companySchema.set('toJSON', { virtuals: true });
companySchema.set('toObject', { virtuals: true });

const Company = mongoose.model('Company', companySchema);

export default Company;