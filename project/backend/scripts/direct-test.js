import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const directTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    const superadmin = await User.findOne({ email: 'superadmin@logistics.com' }).select('+password');
    
    if (superadmin) {
      console.log('✅ User found');
      console.log('🔒 Stored password hash:', superadmin.password.substring(0, 20) + '...');
      
      // Test direct bcrypt comparison
      const password = 'password123';
      console.log('🧪 Testing password:', password);
      
      const directResult = await bcrypt.compare(password, superadmin.password);
      console.log('🔐 Direct bcrypt.compare result:', directResult);
      
      const methodResult = await superadmin.comparePassword(password);
      console.log('🔐 Model method result:', methodResult);
      
      // Let's create a fresh hash and compare
      console.log('\n🔧 Creating fresh hash...');
      const freshHash = await bcrypt.hash(password, 12);
      console.log('🆕 Fresh hash:', freshHash.substring(0, 20) + '...');
      
      const freshResult = await bcrypt.compare(password, freshHash);
      console.log('🔐 Fresh hash comparison:', freshResult);
      
      // Update user with fresh hash
      await User.findByIdAndUpdate(superadmin._id, { password: freshHash });
      console.log('✅ Updated user with fresh hash');
      
      // Test the updated user
      const updatedUser = await User.findById(superadmin._id).select('+password');
      const finalResult = await updatedUser.comparePassword(password);
      console.log('🔐 Final test result:', finalResult);
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

directTest();
