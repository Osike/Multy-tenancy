import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Test 1: Check if users exist
    const users = await User.find({}).select('email role username');
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - username: ${user.username}`);
    });

    // Test 2: Try to find super admin
    const superAdmin = await User.findOne({ email: 'admin@tdms.com' }).select('+password');
    if (!superAdmin) {
      console.log('\n❌ Super admin not found!');
      return;
    }
    console.log('\n✅ Super admin found:', superAdmin.email);

    // Test 3: Check password
    const isPasswordValid = await bcrypt.compare('admin123', superAdmin.password);
    console.log('\n🔑 Password check result:', isPasswordValid ? '✅ Valid' : '❌ Invalid');

    // Test 4: Check password using user method
    const isPasswordValidMethod = await superAdmin.comparePassword('admin123');
    console.log('🔑 Password check (user method):', isPasswordValidMethod ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

testLogin();