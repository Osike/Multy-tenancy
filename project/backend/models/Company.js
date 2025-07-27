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
}, {
  timestamps: true,
});

// Index for better query performance
companySchema.index({ companyName: 1 });
companySchema.index({ status: 1 });

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

// Ensure virtual fields are serialized
companySchema.set('toJSON', { virtuals: true });
companySchema.set('toObject', { virtuals: true });

const Company = mongoose.model('Company', companySchema);

export default Company;