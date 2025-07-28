import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const debugPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Get the super admin with password
    const user = await User.findOne({ email: 'admin@tdms.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n🔍 Debug Info:');
    console.log('User email:', user.email);
    console.log('Stored password hash:', user.password);
    console.log('Hash length:', user.password?.length);
    console.log('Password starts with $2a or $2b:', user.password?.startsWith('$2'));

    // Test different methods
    console.log('\n🧪 Testing password methods:');
    
    // Method 1: Direct bcrypt compare
    const directCompare = await bcrypt.compare('admin123', user.password);
    console.log('1. Direct bcrypt.compare():', directCompare ? '✅' : '❌');

    // Method 2: User method (if exists)
    if (typeof user.comparePassword === 'function') {
      try {
        const userMethodCompare = await user.comparePassword('admin123');
        console.log('2. user.comparePassword():', userMethodCompare ? '✅' : '❌');
      } catch (error) {
        console.log('2. user.comparePassword() ERROR:', error.message);
      }
    } else {
      console.log('2. user.comparePassword() method does not exist');
    }

    // Method 3: Test if password is actually hashed
    console.log('3. Password looks hashed:', user.password?.length > 50 ? '✅' : '❌');

    // Method 4: Test with a freshly hashed password
    const freshHash = await bcrypt.hash('admin123', 12);
    const freshCompare = await bcrypt.compare('admin123', freshHash);
    console.log('4. Fresh hash test:', freshCompare ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

debugPassword();