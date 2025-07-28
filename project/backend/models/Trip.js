import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
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
  rate: {
    type: Number,
    required: true,
    min: [0, 'Rate must be positive'],
    max: [1000000, 'Rate cannot exceed $1,000,000']
  },
  fuelCostUsd: {
    type: Number,
    required: true,
    min: [0, 'Fuel cost must be positive'],
    max: [100000, 'Fuel cost cannot exceed $100,000']
  },
  fuelLiters: {
    type: Number,
    required: true,
    min: [0, 'Fuel liters must be positive'],
    max: [10000, 'Fuel liters cannot exceed 10,000L']
  },
  mileage: {
    type: Number,
    required: true,
    min: [0, 'Mileage must be positive'],
    max: [50000, 'Mileage cannot exceed 50,000 miles']
  },
  driverSalary: {
    type: Number,
    required: true,
    min: [0, 'Driver salary must be positive'],
    max: [50000, 'Driver salary cannot exceed $50,000']
  },
  maintenanceCost: {
    type: Number,
    required: true,
    min: [0, 'Maintenance cost must be positive'],
    max: [100000, 'Maintenance cost cannot exceed $100,000']
  },
  roadTolls: {
    type: Number,
    required: true,
    min: [0, 'Road tolls must be positive'],
    max: [10000, 'Road tolls cannot exceed $10,000']
  },
  routeDetails: {
    startLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Start location cannot exceed 200 characters']
    },
    endLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'End location cannot exceed 200 characters']
    },
  },
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
  loadDetails: {
    weight: {
      type: Number,
      required: true,
      min: [0, 'Load weight must be positive'],
      max: [200000, 'Load weight cannot exceed 200,000 lbs']
    },
    goodsType: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Goods type cannot exceed 100 characters']
    },
  },
  tripStartDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Trip start date cannot be in the future'
    }
  },
  tripEndDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        return date > this.tripStartDate && date <= new Date();
      },
      message: 'Trip end date must be after start date and not in the future',
    },
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  },
  attachments: [{
    fileName: {
      type: String,
      maxlength: [255, 'File name cannot exceed 255 characters']
    },
    filePath: {
      type: String,
      maxlength: [500, 'File path cannot exceed 500 characters']
    },
    fileType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'application/pdf'],
      message: 'File type must be JPEG, PNG, or PDF'
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
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(driverId) {
        if (!driverId) return true; // Optional field
        const driver = await mongoose.model('User').findById(driverId);
        return driver && 
               driver.role === 'driver' && 
               driver.companyId.toString() === this.companyId.toString();
      },
      message: 'Assigned driver must be a driver role in the same company'
    }
  },
  totalExpenses: {
    type: Number,
    default: 0,
    min: [0, 'Total expenses cannot be negative']
  },
  netProfit: {
    type: Number,
    default: 0,
  },
  fuelEfficiency: {
    type: Number,
    default: 0,
    min: [0, 'Fuel efficiency cannot be negative']
  },
  tripDurationHours: {
    type: Number,
    default: 0,
    min: [0, 'Trip duration cannot be negative']
  },
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
tripSchema.index({ companyId: 1, tripStartDate: -1 });
tripSchema.index({ companyId: 1, truck: 1 });
tripSchema.index({ companyId: 1, customer: 1 });
tripSchema.index({ companyId: 1, status: 1 });
tripSchema.index({ companyId: 1, assignedDriver: 1 });
tripSchema.index({ companyId: 1, createdAt: -1 });

// Pre-save middleware to calculate derived fields
tripSchema.pre('save', function(next) {
  try {
    // Calculate total expenses
    this.totalExpenses = this.fuelCostUsd + this.driverSalary + this.maintenanceCost + this.roadTolls;
    
    // Calculate net profit
    this.netProfit = this.rate - this.totalExpenses;
    
    // Calculate fuel efficiency (liters per mile)
    this.fuelEfficiency = this.mileage > 0 ? this.fuelLiters / this.mileage : 0;
    
    // Calculate trip duration in hours
    if (this.tripStartDate && this.tripEndDate) {
      const durationMs = this.tripEndDate.getTime() - this.tripStartDate.getTime();
      this.tripDurationHours = durationMs / (1000 * 60 * 60);
    }
    
    // Round calculated values to 2 decimal places
    this.totalExpenses = Math.round(this.totalExpenses * 100) / 100;
    this.netProfit = Math.round(this.netProfit * 100) / 100;
    this.fuelEfficiency = Math.round(this.fuelEfficiency * 100) / 100;
    this.tripDurationHours = Math.round(this.tripDurationHours * 100) / 100;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get trip statistics for a company
tripSchema.statics.getCompanyStats = function(companyId, startDate, endDate) {
  const matchStage = { companyId: new mongoose.Types.ObjectId(companyId) };
  
  if (startDate || endDate) {
    matchStage.tripStartDate = {};
    if (startDate) matchStage.tripStartDate.$gte = new Date(startDate);
    if (endDate) matchStage.tripStartDate.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalRevenue: { $sum: '$rate' },
        totalExpenses: { $sum: '$totalExpenses' },
        totalProfit: { $sum: '$netProfit' },
        avgFuelEfficiency: { $avg: '$fuelEfficiency' },
        avgTripDuration: { $avg: '$tripDurationHours' },
        totalMileage: { $sum: '$mileage' },
        totalFuelUsed: { $sum: '$fuelLiters' }
      }
    }
  ]);
};

// Virtual for profit margin percentage
tripSchema.virtual('profitMargin').get(function() {
  return this.rate > 0 ? ((this.netProfit / this.rate) * 100) : 0;
});

// Ensure virtual fields are serialized
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;