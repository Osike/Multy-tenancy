import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const debugLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Test the exact login flow
    const email = 'admin@tdms.com';
    const password = 'admin123';

    console.log('\n🔍 Step 1: Finding user with .select("+password")');
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:', {
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      isActive: user.isActive,
      role: user.role
    });

    console.log('\n🔍 Step 2: Testing direct bcrypt.compare');
    try {
      const directCompare = await bcrypt.compare(password, user.password);
      console.log('Direct bcrypt.compare result:', directCompare ? '✅ SUCCESS' : '❌ FAILED');
    } catch (error) {
      console.log('❌ Direct bcrypt.compare error:', error.message);
    }

    console.log('\n🔍 Step 3: Testing user.comparePassword method');
    try {
      if (typeof user.comparePassword === 'function') {
        const methodCompare = await user.comparePassword(password);
        console.log('user.comparePassword result:', methodCompare ? '✅ SUCCESS' : '❌ FAILED');
      } else {
        console.log('❌ comparePassword method not found on user object');
        console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(user)));
      }
    } catch (error) {
      console.log('❌ user.comparePassword error:', error.message);
    }

    console.log('\n🔍 Step 4: Check user.isActive status');
    console.log('User isActive:', user.isActive);

    console.log('\n🔍 Step 5: Check company status (if applicable)');
    if (user.role !== 'super_admin' && user.companyId) {
      const Company = await import('../models/Company.js');
      const company = await Company.default.findById(user.companyId);
      console.log('Company status:', company ? company.status : 'Company not found');
    } else {
      console.log('User is super_admin or has no companyId');
    }

    console.log('\n🔍 Step 6: Manual login simulation');
    console.log('Simulating exact login flow...');
    
    // Simulate the exact login controller logic
    if (!user.isActive) {
      console.log('❌ Account is deactivated');
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password validation result:', isPasswordValid ? '✅ VALID' : '❌ INVALID');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

debugLogin();