import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  truckIdCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Truck ID code cannot exceed 50 characters'],
    index: true,
  },
  make: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters'],
  },
  model: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters'],
  },
  year: {
    type: Number,
    required: true,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
  },
  licensePlate: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'License plate cannot exceed 20 characters'],
    unique: true,
  },
  vin: {
    type: String,
    trim: true,
    maxlength: [17, 'VIN cannot exceed 17 characters'],
    minlength: [17, 'VIN must be exactly 17 characters'],
    uppercase: true,
    sparse: true, // Allows multiple null values
  },
  fuelType: {
    type: String,
    enum: ['Diesel', 'Gasoline', 'Electric', 'Hybrid'],
    default: 'Diesel',
  },
  fuelCapacity: {
    type: Number,
    min: [0, 'Fuel capacity must be positive'],
    max: [2000, 'Fuel capacity cannot exceed 2000 liters'],
  },
  mileage: {
    type: Number,
    default: 0,
    min: [0, 'Mileage cannot be negative'],
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Out of Service', 'Retired'],
    default: 'Active',
    index: true,
  },
  currentDriver: {
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
      message: 'Current driver must be a driver role in the same company'
    }
  },
  purchaseDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date <= new Date();
      },
      message: 'Purchase date cannot be in the future'
    }
  },
  purchasePrice: {
    type: Number,
    min: [0, 'Purchase price must be positive'],
    max: [10000000, 'Purchase price cannot exceed $10,000,000'],
  },
  lastMaintenanceDate: {
    type: Date,
  },
  nextMaintenanceDate: {
    type: Date,
  },
  maintenanceInterval: {
    type: Number,
    default: 10000, // Default maintenance every 10,000 miles
    min: [1000, 'Maintenance interval must be at least 1,000 miles'],
    max: [50000, 'Maintenance interval cannot exceed 50,000 miles'],
  },
  insuranceExpiry: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Insurance must not be expired'
    }
  },
  registrationExpiry: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Registration must not be expired'
    }
  },
  specifications: {
    grossWeight: {
      type: Number,
      min: [0, 'Gross weight must be positive'],
      max: [200000, 'Gross weight cannot exceed 200,000 lbs'],
    },
    cargoCapacity: {
      type: Number,
      min: [0, 'Cargo capacity must be positive'],
      max: [100000, 'Cargo capacity cannot exceed 100,000 lbs'],
    },
    dimensions: {
      length: {
        type: Number,
        min: [0, 'Length must be positive'],
      },
      width: {
        type: Number,
        min: [0, 'Width must be positive'],
      },
      height: {
        type: Number,
        min: [0, 'Height must be positive'],
      },
    },
  },
  documents: [{
    documentType: {
      type: String,
      enum: ['Insurance', 'Registration', 'Inspection', 'Other'],
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
    expiryDate: {
      type: Date,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound indexes for better query performance
truckSchema.index({ companyId: 1, truckIdCode: 1 }, { unique: true });
truckSchema.index({ companyId: 1, status: 1 });
truckSchema.index({ companyId: 1, currentDriver: 1 });
truckSchema.index({ companyId: 1, isActive: 1 });

// Virtual for maintenance status
truckSchema.virtual('maintenanceStatus').get(function() {
  if (!this.lastMaintenanceDate || !this.maintenanceInterval) {
    return 'Unknown';
  }
  
  const milesSinceLastMaintenance = this.mileage - (this.lastMaintenanceMileage || 0);
  const maintenanceDue = milesSinceLastMaintenance >= this.maintenanceInterval;
  
  if (maintenanceDue) {
    return 'Due';
  } else if (milesSinceLastMaintenance >= this.maintenanceInterval * 0.8) {
    return 'Soon';
  } else {
    return 'Good';
  }
});

// Virtual for document expiry warnings
truckSchema.virtual('expiringDocuments').get(function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const expiring = [];
  
  // Check insurance
  if (this.insuranceExpiry && this.insuranceExpiry <= thirtyDaysFromNow) {
    expiring.push({
      type: 'Insurance',
      expiryDate: this.insuranceExpiry,
      daysUntilExpiry: Math.ceil((this.insuranceExpiry - new Date()) / (1000 * 60 * 60 * 24))
    });
  }
  
  // Check registration
  if (this.registrationExpiry && this.registrationExpiry <= thirtyDaysFromNow) {
    expiring.push({
      type: 'Registration',
      expiryDate: this.registrationExpiry,
      daysUntilExpiry: Math.ceil((this.registrationExpiry - new Date()) / (1000 * 60 * 60 * 24))
    });
  }
  
  // Check document expiries
  this.documents.forEach(doc => {
    if (doc.expiryDate && doc.expiryDate <= thirtyDaysFromNow) {
      expiring.push({
        type: doc.documentType,
        expiryDate: doc.expiryDate,
        daysUntilExpiry: Math.ceil((doc.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
      });
    }
  });
  
  return expiring;
});

// Pre-save middleware
truckSchema.pre('save', function(next) {
  // Update next maintenance date if maintenance interval or mileage changed
  if (this.isModified('maintenanceInterval') || this.isModified('mileage')) {
    if (this.lastMaintenanceDate && this.maintenanceInterval) {
      const lastMaintenanceMileage = this.lastMaintenanceMileage || 0;
      const nextMaintenanceMileage = lastMaintenanceMileage + this.maintenanceInterval;
      
      if (this.mileage >= nextMaintenanceMileage) {
        this.nextMaintenanceDate = new Date();
      }
    }
  }
  
  next();
});

// Static method to get available trucks for a company
truckSchema.statics.getAvailableTrucks = function(companyId) {
  return this.find({
    companyId,
    status: 'Active',
    isActive: true,
    $or: [
      { currentDriver: { $exists: false } },
      { currentDriver: null }
    ]
  }).select('truckIdCode make model licensePlate');
};

// Static method to get company truck statistics
truckSchema.statics.getCompanyStats = function(companyId) {
  return this.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: null,
        totalTrucks: { $sum: 1 },
        activeTrucks: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
          }
        },
        trucksInMaintenance: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0]
          }
        },
        outOfService: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Out of Service'] }, 1, 0]
          }
        },
        avgMileage: { $avg: '$mileage' },
        totalMileage: { $sum: '$mileage' }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
truckSchema.set('toJSON', { virtuals: true });
truckSchema.set('toObject', { virtuals: true });

const Truck = mongoose.model('Truck', truckSchema);

export default Truck;