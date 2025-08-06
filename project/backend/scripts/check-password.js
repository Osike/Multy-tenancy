import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Find the super admin user
    const user = await User.findOne({ email: 'superadmin@logistics.com' }).select('+password');
    
    if (!user) {
      console.log('❌ Super admin user not found');
      return;
    }

    console.log('✅ User found:', {
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });

    // Test password comparison
    const testPassword = 'password123';
    console.log(`\n🔍 Testing password: "${testPassword}"`);
    
    try {
      const isValid = await user.comparePassword(testPassword);
      console.log('✅ Password comparison result:', isValid);
    } catch (error) {
      console.log('❌ Password comparison error:', error.message);
    }

    // Also test with bcrypt directly
    try {
      const directCompare = await bcrypt.compare(testPassword, user.password);
      console.log('✅ Direct bcrypt comparison:', directCompare);
    } catch (error) {
      console.log('❌ Direct bcrypt error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

checkPassword();
