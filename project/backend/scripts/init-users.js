import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Company from '../models/Company.js';

// Load environment variables
dotenv.config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log('✅ Existing data cleared');

    // Use plain password - User model will hash it automatically
    const plainPassword = 'password123';

    // 1. Create Super Admin (no company association)
    const superAdmin = new User({
      username: 'superadmin',
      email: 'superadmin@logistics.com',
      password: plainPassword,
      role: 'super_admin',
      fullName: 'Super Administrator',
      phoneNumber: '+1234567888',
      isActive: true
    });
    await superAdmin.save();
    console.log('✅ Super Admin created');

    // 2. Create Demo Company
    const demoCompany = new Company({
      companyName: 'Demo Logistics Company',
      businessRegistrationNumber: 'DLC-2024-001',
      taxId: 'TX123456789',
      contactEmail: 'contact@demologistics.com',
      contactPhone: '+1234567890',
      address: {
        street: '123 Business Street',
        city: 'Demo City',
        state: 'DC',
        zipCode: '12345',
        country: 'USA'
      },
      industry: 'Logistics',
      companySize: 'Medium (11-50)',
      website: 'https://demologistics.com',
      subscription: {
        plan: 'Professional',
        status: 'Active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maxUsers: 50,
        maxTrucks: 100
      }
    });
    await demoCompany.save();
    console.log('✅ Demo Company created');

    // 3. Create Company Admin
    const companyAdmin = new User({
      companyId: demoCompany._id,
      username: 'companyadmin',
      email: 'admin@demologistics.com',
      password: plainPassword,
      role: 'company_admin',
      fullName: 'Company Administrator',
      phoneNumber: '+1234567891',
      isActive: true
    });
    await companyAdmin.save();
    console.log('✅ Company Admin created');

    // 4. Create Dispatcher
    const dispatcher = new User({
      companyId: demoCompany._id,
      username: 'dispatcher1',
      email: 'dispatcher@demologistics.com',
      password: plainPassword,
      role: 'dispatcher',
      fullName: 'John Dispatcher',
      phoneNumber: '+1234567892',
      isActive: true
    });
    await dispatcher.save();
    console.log('✅ Dispatcher created');

    // 5. Create Driver
    const driver = new User({
      companyId: demoCompany._id,
      username: 'driver1',
      email: 'driver@demologistics.com',
      password: plainPassword,
      role: 'driver',
      fullName: 'Mike Driver',
      phoneNumber: '+1234567893',
      licenseNumber: 'DL123456789',
      isActive: true,
      driverInfo: {
        licenseClass: 'CDL-A',
        licenseExpiryDate: new Date('2025-12-31'),
        medicalCertExpiry: new Date('2025-06-30'),
        emergencyContact: {
          name: 'Jane Driver',
          phone: '+1234567894',
          relationship: 'Spouse'
        }
      }
    });
    await driver.save();
    console.log('✅ Driver created');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('Super Admin: superadmin / password123');
    console.log('Company Admin: companyadmin / password123');
    console.log('Dispatcher: dispatcher1 / password123');
    console.log('Driver: driver1 / password123');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

// Run the initialization
initializeDatabase();
