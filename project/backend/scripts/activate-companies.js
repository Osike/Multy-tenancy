import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

const activateCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Update all companies to have Active subscription status
    const result = await Company.updateMany(
      {}, 
      { 
        $set: { 
          'subscription.status': 'Active' 
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} companies to Active status`);

    // Show updated companies
    const companies = await Company.find({});
    console.log('\n🏢 Updated companies:');
    companies.forEach(company => {
      console.log(`   📋 ${company.companyName}: ${company.subscription.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

activateCompanies();
