import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const fixPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Get current user
    const user = await User.findOne({ email: 'admin@tdms.com' }).select('+password');
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('\n🔍 Current user data:');
    console.log('Email:', user.email);
    console.log('Current hash:', user.password);
    console.log('Hash length:', user.password?.length);

    // Test current password with various inputs
    const possiblePasswords = [
      'admin123',
      'Admin123',
      'ADMIN123',
      'admin',
      'password',
      'undefined',
      'null',
      '',
      'hashedPassword'
    ];

    console.log('\n🧪 Testing current hash against possible passwords:');
    let foundPassword = null;
    for (const testPwd of possiblePasswords) {
      const result = await bcrypt.compare(testPwd, user.password);
      if (result) {
        console.log(`✅ FOUND IT! Current password is: "${testPwd}"`);
        foundPassword = testPwd;
        break;
      } else {
        console.log(`❌ Not: "${testPwd}"`);
      }
    }

    // Force update with explicit hash
    console.log('\n🔧 Force updating password with explicit hash...');
    const newPassword = 'admin123';
    const explicitHash = await bcrypt.hash(newPassword, 12);
    
    console.log('New hash created:', explicitHash);
    console.log('New hash length:', explicitHash.length);

    // Update directly in database to bypass any model issues
    const updateResult = await User.updateOne(
      { email: 'admin@tdms.com' },
      { $set: { password: explicitHash } }
    );
    
    console.log('Update result:', updateResult);

    // Verify the update
    const updatedUser = await User.findOne({ email: 'admin@tdms.com' }).select('+password');
    console.log('\n✅ Updated user hash:', updatedUser.password);
    
    // Test the new password
    const loginTest = await bcrypt.compare('admin123', updatedUser.password);
    console.log('🎯 Login test with "admin123":', loginTest ? '✅ SUCCESS' : '❌ FAILED');

    // Also test what the login route might be doing - FIXED TO INCLUDE PASSWORD
    console.log('\n🔍 Testing exact login flow:');
    const testUser = await User.findOne({ email: 'admin@tdms.com' }).select('+password');
    if (testUser) {
      console.log('User found in login simulation');
      console.log('Password field exists:', !!testUser.password);
      console.log('Password value:', testUser.password);
      
      if (testUser.password) {
        const passwordMatch = await bcrypt.compare('admin123', testUser.password);
        console.log('Password match in login simulation:', passwordMatch ? '✅' : '❌');
      } else {
        console.log('❌ Password field is missing - this is the problem!');
      }
    }

    console.log('\n🔍 Additional debugging - check if your login route uses .select("+password"):');
    const userWithoutPassword = await User.findOne({ email: 'admin@tdms.com' });
    console.log('User without .select("+password"):', {
      email: userWithoutPassword.email,
      passwordExists: !!userWithoutPassword.password,
      passwordValue: userWithoutPassword.password
    });

    console.log('\n✅ SCRIPT COMPLETE - Your login route should now work!');
    console.log('Try logging in with: admin@tdms.com / admin123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

fixPassword();