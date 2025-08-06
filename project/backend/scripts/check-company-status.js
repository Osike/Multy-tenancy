import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

const checkCompanyStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Find all companies
    const companies = await Company.find({});
    
    console.log('🏢 Found companies:');
    companies.forEach(company => {
      console.log(`\n📋 Company: ${company.companyName}`);
      console.log(`   ID: ${company._id}`);
      console.log(`   Contact Email: ${company.contactEmail}`);
      console.log(`   Direct Status Field: ${company.status}`);
      console.log(`   Subscription Status: ${company.subscription?.status}`);
      console.log(`   Is Active: ${company.isActive}`);
      console.log(`   Created: ${company.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

checkCompanyStatus();
