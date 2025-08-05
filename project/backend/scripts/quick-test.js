import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const quickTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // List all users
    const allUsers = await User.find({}, 'email username role').lean();
    console.log('📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - ${user.role}`);
    });

    // Find superadmin with exact email
    const superadmin = await User.findOne({ email: 'superadmin@logistics.com' }).select('+password');
    
    if (superadmin) {
      console.log('\n✅ Superadmin found!');
      console.log('📧 Email:', superadmin.email);
      console.log('👤 Username:', superadmin.username);
      console.log('🔑 Role:', superadmin.role);
      console.log('✅ Active:', superadmin.isActive);
      console.log('🔒 Has password:', !!superadmin.password);
      
      // Test password
      const passwordTest = await superadmin.comparePassword('password123');
      console.log('🔐 Password test result:', passwordTest);
      
      if (!passwordTest) {
        console.log('\n🔧 Fixing password...');
        const newHashedPassword = await bcrypt.hash('password123', 12);
        superadmin.password = newHashedPassword;
        await superadmin.save();
        console.log('✅ Password fixed!');
        
        // Test again
        const retestUser = await User.findById(superadmin._id).select('+password');
        const retestResult = await retestUser.comparePassword('password123');
        console.log('🔐 Retest result:', retestResult);
      }
    } else {
      console.log('❌ Superadmin not found');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

quickTest();
