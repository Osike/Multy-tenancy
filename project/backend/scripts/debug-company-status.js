import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Company from '../models/Company.js';

dotenv.config();

const debugCompanyStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Find the company admin user
    const user = await User.findOne({ email: 'admin@demologistics.com' })
      .populate('companyId', 'companyName subscription isActive');
    
    console.log('👤 User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Company ID: ${user.companyId?._id}`);
    console.log(`   Company Name: ${user.companyId?.companyName}`);
    console.log(`   Company isActive: ${user.companyId?.isActive}`);
    console.log(`   Company subscription:`, user.companyId?.subscription);

    // Also check the company directly
    console.log('\n🏢 Company direct lookup:');
    const company = await Company.findById(user.companyId?._id);
    console.log(`   Company Name: ${company.companyName}`);
    console.log(`   Is Active: ${company.isActive}`);
    console.log(`   Subscription Status: ${company.subscription.status}`);
    console.log(`   Subscription Plan: ${company.subscription.plan}`);

    // Test the condition that's causing the issue
    console.log('\n🔍 Testing auth condition:');
    console.log(`   company.subscription?.status !== 'Active': ${company.subscription?.status !== 'Active'}`);
    console.log(`   company.subscription?.status !== 'Trial': ${company.subscription?.status !== 'Trial'}`);
    console.log(`   Both conditions (should be false): ${(company.subscription?.status !== 'Active' && company.subscription?.status !== 'Trial')}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

debugCompanyStatus();
