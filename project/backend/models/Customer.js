import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters'],
    index: true,
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters'],
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        if (!email) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    },
    maxlength: [100, 'Email cannot exceed 100 characters'],
  },
  contactPhone: {
    type: String,
    trim: true,
    validate: {
      validator: function(phone) {
        if (!phone) return true; // Optional field
        return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please provide a valid phone number'
    },
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters'],
    },
    zipCode: {
      type: String,
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
  billingAddress: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters'],
    },
    zipCode: {
      type: String,
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
  customerType: {
    type: String,
    enum: ['Individual', 'Business', 'Corporation', 'Government'],
    default: 'Business',
  },
  paymentTerms: {
    type: String,
    enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid'],
    default: 'Net 30',
  },
  creditLimit: {
    type: Number,
    min: [0, 'Credit limit cannot be negative'],
    max: [10000000, 'Credit limit cannot exceed $10,000,000'],
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 0,
  },
  totalTripsCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Total trips cannot be negative'],
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: [0, 'Total revenue cannot be negative'],
  },
  lastTripDate: {
    type: Date,
  },
  preferredRoutes: [{
    startLocation: {
      type: String,
      trim: true,
      maxlength: [200, 'Start location cannot exceed 200 characters'],
    },
    endLocation: {
      type: String,
      trim: true,
      maxlength: [200, 'End location cannot exceed 200 characters'],
    },
    frequency: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'As Needed'],
      default: 'As Needed',
    },
  }],
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special instructions cannot exceed 1000 characters'],
  },
  documents: [{
    documentType: {
      type: String,
      enum: ['Contract', 'Insurance Certificate', 'Tax Document', 'Other'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
    },
    filePath: {
      type: String,
      required: true,
      maxlength: [500, 'File path cannot exceed 500 characters'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
  }],
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Emergency contact phone cannot exceed 20 characters'],
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters'],
    },
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Blacklisted'],
    default: 'Active',
    index: true,
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5'],
    default: 5,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound indexes for better query performance
customerSchema.index({ companyId: 1, customerName: 1 }, { unique: true });
customerSchema.index({ companyId: 1, status: 1 });
customerSchema.index({ companyId: 1, isActive: 1 });
customerSchema.index({ companyId: 1, customerType: 1 });
customerSchema.index({ companyId: 1, lastTripDate: -1 });

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  if (!this.address.street && !this.address.city) return '';
  
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.state) parts.push(this.address.state);
  if (this.address.zipCode) parts.push(this.address.zipCode);
  if (this.address.country && this.address.country !== 'USA') parts.push(this.address.country);
  
  return parts.join(', ');
});

// Virtual for credit status
customerSchema.virtual('creditStatus').get(function() {
  if (this.creditLimit === 0) return 'No Credit';
  
  const utilization = (this.currentBalance / this.creditLimit) * 100;
  
  if (utilization >= 100) return 'Over Limit';
  if (utilization >= 90) return 'Near Limit';
  if (utilization >= 70) return 'High Utilization';
  if (utilization >= 50) return 'Moderate Utilization';
  return 'Good Standing';
});

// Virtual for average trip value
customerSchema.virtual('averageTripValue').get(function() {
  if (this.totalTripsCompleted === 0) return 0;
  return Math.round((this.totalRevenue / this.totalTripsCompleted) * 100) / 100;
});

// Pre-save middleware
customerSchema.pre('save', function(next) {
  // If billing address is not provided, use main address
  if (!this.billingAddress.street && this.address.street) {
    this.billingAddress = { ...this.address.toObject() };
  }
  
  // Ensure current balance doesn't exceed credit limit warning
  if (this.currentBalance > this.creditLimit && this.creditLimit > 0) {
    console.warn(`Customer ${this.customerName} balance (${this.currentBalance}) exceeds credit limit (${this.creditLimit})`);
  }
  
  next();
});

// Static method to get top customers by revenue
customerSchema.statics.getTopCustomers = function(companyId, limit = 10) {
  return this.find({
    companyId,
    isActive: true,
    status: 'Active'
  })
  .sort({ totalRevenue: -1 })
  .limit(limit)
  .select('customerName totalRevenue totalTripsCompleted lastTripDate rating');
};

// Static method to get customers needing attention
customerSchema.statics.getCustomersNeedingAttention = function(companyId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    companyId,
    isActive: true,
    $or: [
      { currentBalance: { $gt: 0 } }, // Outstanding balance
      { lastTripDate: { $lt: thirtyDaysAgo } }, // Inactive customers
      { rating: { $lt: 3 } }, // Low-rated customers
    ]
  })
  .select('customerName currentBalance lastTripDate rating creditStatus')
  .sort({ currentBalance: -1 });
};

// Static method to get company customer statistics
customerSchema.statics.getCompanyStats = function(companyId) {
  return this.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        activeCustomers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
          }
        },
        totalRevenue: { $sum: '$totalRevenue' },
        totalOutstandingBalance: { $sum: '$currentBalance' },
        avgTripValue: { $avg: '$averageTripValue' },
        avgRating: { $avg: '$rating' },
        totalTrips: { $sum: '$totalTripsCompleted' }
      }
    }
  ]);
};

// Instance method to calculate customer lifetime value
customerSchema.methods.getLifetimeValue = function() {
  const monthsSinceFirstTrip = this.createdAt ? 
    Math.max(1, Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24 * 30))) : 1;
  
  return {
    totalValue: this.totalRevenue,
    monthlyAverage: Math.round((this.totalRevenue / monthsSinceFirstTrip) * 100) / 100,
    tripsPerMonth: Math.round((this.totalTripsCompleted / monthsSinceFirstTrip) * 100) / 100,
    averageTripValue: this.averageTripValue
  };
};

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;