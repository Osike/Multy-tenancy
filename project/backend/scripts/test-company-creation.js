import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const testCompanyCreation = async () => {
  try {
    console.log('🔐 Step 1: Logging in as superadmin...');
    
    // Step 1: Login to get token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@logistics.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    console.log('✅ Login successful!');
    const token = loginData.data.token;

    console.log('🏢 Step 2: Creating test company...');

    // Step 2: Create company
    const companyData = {
      companyName: 'Postman Test Company',
      contactEmail: 'contact@postmantest.com',
      contactPhone: '+1234567890',
      address: {
        street: '456 Postman Street',
        city: 'API City',
        state: 'TS',
        zipCode: '54321',
        country: 'USA'
      },
      businessRegistrationNumber: 'PTC-2024-001',
      taxId: 'PTC123456789',
      industry: 'Logistics',
      companySize: 'Medium (11-50)',
      website: 'https://postmantest.com',
      subscription: {
        plan: 'Professional',
        maxUsers: 25,
        maxTrucks: 75,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    const companyResponse = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyData)
    });

    const companyResult = await companyResponse.json();

    if (companyResult.success) {
      console.log('✅ Company created successfully!');
      console.log('📋 Company Details:', {
        id: companyResult.data.company._id,
        name: companyResult.data.company.companyName,
        email: companyResult.data.company.contactEmail
      });
    } else {
      console.error('❌ Company creation failed:', companyResult.message);
      if (companyResult.errors) {
        console.error('📝 Validation Errors:', companyResult.errors);
      }
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

// Run the test
testCompanyCreation();
