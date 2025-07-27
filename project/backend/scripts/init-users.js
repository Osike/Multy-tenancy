import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists. Skipping initialization.');
      return;
    }

    // 1. Create Super Admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const superAdmin = new User({
      username: 'superadmin',
      email: 'admin@tdms.com',
      password: hashedPassword,
      role: 'super_admin',
      fullName: 'System Administrator',
      phoneNumber: '+1234567890',
      isActive: true
    });
    await superAdmin.save();
    console.log('✅ Super Admin created');

    // 2. Create Demo Company
    const demoCompany = new Company({
      companyName: 'Demo Logistics Co.',
      contactEmail: 'contact@demologistics.com',
      address: '123 Business Street, Demo City, DC 12345',
      phoneNumber: '+1234567890',
      registrationNumber: 'DLC-2024-001',
      status: 'Active',
      subscriptionPlan: 'Premium',
      maxUsers: 50,
      maxTrucks: 100,
      features: ['trip_management', 'analytics', 'customer_management']
    });
    await demoCompany.save();
    console.log('✅ Demo Company created');

    // 3. Create Company Admin
    const companyAdmin = new User({
      companyId: demoCompany._id,
      username: 'companyadmin',
      email: 'admin@demologistics.com',
      password: hashedPassword,
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
      password: hashedPassword,
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
      password: hashedPassword,
      role: 'driver',
      fullName: 'Mike Driver',
      phoneNumber: '+1234567893',
      licenseNumber: 'DL123456789',
      isActive: true
    });
    await driver.save();
    console.log('✅ Driver created');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Super Admin: admin@tdms.com / admin123');
    console.log('   Company Admin: admin@demologistics.com / admin123');
    console.log('   Dispatcher: dispatcher@demologistics.com / admin123');
    console.log('   Driver: driver@demologistics.com / admin123');
    console.log('\n⚡ You can now start your application and log in!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the initialization
initializeDatabase();
