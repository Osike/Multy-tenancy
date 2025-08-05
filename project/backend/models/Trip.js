import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  tripId: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Trip ID cannot exceed 50 characters'],
    index: true
  },
  truck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck',
    required: true,
    validate: {
      validator: async function(truckId) {
        const truck = await mongoose.model('Truck').findById(truckId);
        return truck && truck.companyId.toString() === this.companyId.toString();
      },
      message: 'Truck must belong to the same company'
    }
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(driverId) {
        const driver = await mongoose.model('User').findById(driverId);
        return driver && 
               driver.role === 'driver' && 
               driver.companyId.toString() === this.companyId.toString();
      },
      message: 'Driver must be a driver role in the same company'
    }
  },
  tripDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Route Information
  fromLocation: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'From location cannot exceed 200 characters']
  },
  toLocation: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'To location cannot exceed 200 characters']
  },
  // Cargo/Goods Information
  cargoDetails: {
    goodsType: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Goods type cannot exceed 100 characters']
    },
    weight: {
      type: Number,
      required: true,
      min: [0, 'Weight must be positive'],
      max: [200000, 'Weight cannot exceed 200,000 lbs']
    },
    weightUnit: {
      type: String,
      enum: ['lbs', 'kg', 'tons'],
      default: 'lbs'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    specialRequirements: [{
      type: String,
      trim: true,
      maxlength: [100, 'Special requirement cannot exceed 100 characters']
    }]
  },
  // Customer/Company Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    validate: {
      validator: async function(customerId) {
        const customer = await mongoose.model('Customer').findById(customerId);
        return customer && customer.companyId.toString() === this.companyId.toString();
      },
      message: 'Customer must belong to the same company'
    }
  },
  // Revenue Section
  rate: {
    type: Number,
    required: true,
    min: [0, 'Rate must be positive'],
    max: [1000000, 'Rate cannot exceed $1,000,000']
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    default: 'USD'
  },
  // Trip Expenses Section
  fuelCost: {
    type: Number,
    required: true,
    min: [0, 'Fuel cost must be positive'],
    max: [100000, 'Fuel cost cannot exceed $100,000'],
    default: 0
  },
  mileageCost: {
    type: Number,
    required: true,
    min: [0, 'Mileage cost must be positive'],
    max: [50000, 'Mileage cost cannot exceed $50,000'],
    default: 0
  },
  driverSalary: {
    type: Number,
    required: true,
    min: [0, 'Driver salary must be positive'],
    max: [50000, 'Driver salary cannot exceed $50,000'],
    default: 0
  },
  roadTolls: {
    type: Number,
    required: true,
    min: [0, 'Road tolls must be positive'],
    max: [10000, 'Road tolls cannot exceed $10,000'],
    default: 0
  },
  // Maintenance Expenses (Dynamic Items)
  maintenanceExpenses: [{
    itemService: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Item/Service cannot exceed 100 characters']
    },
    cost: {
      type: Number,
      required: true,
      min: [0, 'Cost must be positive'],
      max: [50000, 'Cost cannot exceed $50,000']
    },
    serviceProvider: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Service provider cannot exceed 100 characters']
    },
    date: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  // Comments & Attachments
  comments: {
    type: String,
    trim: true,
    maxlength: [2000, 'Comments cannot exceed 2000 characters']
  },
  attachments: [{
    fileName: {
      type: String,
      required: true,
      maxlength: [255, 'File name cannot exceed 255 characters']
    },
    filePath: {
      type: String,
      required: true,
      maxlength: [500, 'File path cannot exceed 500 characters']
    },
    fileType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      message: 'File type must be JPEG, PNG, PDF, or Word document'
    },
    fileSize: {
      type: Number,
      max: [5242880, 'File size cannot exceed 5MB']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Status & Tracking
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled',
    index: true
  },
  // Auto-calculated fields
  totalExpenses: {
    type: Number,
    default: 0,
    min: [0, 'Total expenses cannot be negative']
  },
  totalMaintenanceExpenses: {
    type: Number,
    default: 0,
    min: [0, 'Total maintenance expenses cannot be negative']
  },
  netProfit: {
    type: Number,
    default: 0
  },
  // Record keeping
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId) {
        const user = await mongoose.model('User').findById(userId);
        return user && user.companyId.toString() === this.companyId.toString();
      },
      message: 'Recording user must belong to the same company'
    }
  },
}, {
  timestamps: true,
});

// Compound indexes for better query performance
tripSchema.index({ companyId: 1, tripDate: -1 });
tripSchema.index({ companyId: 1, truck: 1 });
tripSchema.index({ companyId: 1, driver: 1 });
tripSchema.index({ companyId: 1, status: 1 });
tripSchema.index({ companyId: 1, tripId: 1 });
tripSchema.index({ companyId: 1, createdAt: -1 });

// Pre-save middleware to calculate derived fields
tripSchema.pre('save', function(next) {
  try {
    // Calculate total maintenance expenses
    this.totalMaintenanceExpenses = this.maintenanceExpenses.reduce((total, item) => {
      return total + (item.cost || 0);
    }, 0);
    
    // Calculate total trip expenses (excluding maintenance)
    this.totalExpenses = (this.fuelCost || 0) + 
                        (this.mileageCost || 0) + 
                        (this.driverSalary || 0) + 
                        (this.roadTolls || 0);
    
    // Calculate net profit (rate - all expenses including maintenance)
    this.netProfit = (this.rate || 0) - this.totalExpenses - this.totalMaintenanceExpenses;
    
    // Round calculated values to 2 decimal places
    this.totalExpenses = Math.round(this.totalExpenses * 100) / 100;
    this.totalMaintenanceExpenses = Math.round(this.totalMaintenanceExpenses * 100) / 100;
    this.netProfit = Math.round(this.netProfit * 100) / 100;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get trip statistics for a company
tripSchema.statics.getCompanyStats = function(companyId, startDate, endDate) {
  const matchStage = { companyId: new mongoose.Types.ObjectId(companyId) };
  
  if (startDate || endDate) {
    matchStage.tripDate = {};
    if (startDate) matchStage.tripDate.$gte = new Date(startDate);
    if (endDate) matchStage.tripDate.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalRevenue: { $sum: '$rate' },
        totalExpenses: { $sum: { $add: ['$totalExpenses', '$totalMaintenanceExpenses'] } },
        totalProfit: { $sum: '$netProfit' },
        avgProfit: { $avg: '$netProfit' },
        completedTrips: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Virtual for total all expenses (trip + maintenance)
tripSchema.virtual('totalAllExpenses').get(function() {
  return this.totalExpenses + this.totalMaintenanceExpenses;
});

// Virtual for profit margin percentage
tripSchema.virtual('profitMargin').get(function() {
  return this.rate > 0 ? ((this.netProfit / this.rate) * 100) : 0;
});

// Ensure virtual fields are serialized
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;