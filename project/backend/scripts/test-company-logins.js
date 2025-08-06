import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const testCompanyUserLogin = async () => {
  try {
    console.log('🧪 Testing company user login...\n');

    // Test company admin login
    console.log('🏢 Testing Company Admin login...');
    const companyAdminResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@demologistics.com',
        password: 'password123'
      })
    });

    const companyAdminData = await companyAdminResponse.json();
    
    if (companyAdminData.success) {
      console.log('✅ Company Admin login SUCCESS!');
      console.log(`   User: ${companyAdminData.data.user.fullName}`);
      console.log(`   Role: ${companyAdminData.data.user.role}`);
      console.log(`   Company: ${companyAdminData.data.user.companyId?.companyName || 'N/A'}`);
      console.log(`   Token: ${companyAdminData.data.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Company Admin login FAILED:');
      console.log(`   Status: ${companyAdminResponse.status}`);
      console.log(`   Message: ${companyAdminData.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test dispatcher login
    console.log('📋 Testing Dispatcher login...');
    const dispatcherResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dispatcher@demologistics.com',
        password: 'password123'
      })
    });

    const dispatcherData = await dispatcherResponse.json();
    
    if (dispatcherData.success) {
      console.log('✅ Dispatcher login SUCCESS!');
      console.log(`   User: ${dispatcherData.data.user.fullName}`);
      console.log(`   Role: ${dispatcherData.data.user.role}`);
      console.log(`   Company: ${dispatcherData.data.user.companyId?.companyName || 'N/A'}`);
      console.log(`   Token: ${dispatcherData.data.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Dispatcher login FAILED:');
      console.log(`   Status: ${dispatcherResponse.status}`);
      console.log(`   Message: ${dispatcherData.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test driver login
    console.log('🚛 Testing Driver login...');
    const driverResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'driver@demologistics.com',
        password: 'password123'
      })
    });

    const driverData = await driverResponse.json();
    
    if (driverData.success) {
      console.log('✅ Driver login SUCCESS!');
      console.log(`   User: ${driverData.data.user.fullName}`);
      console.log(`   Role: ${driverData.data.user.role}`);
      console.log(`   Company: ${driverData.data.user.companyId?.companyName || 'N/A'}`);
      console.log(`   Token: ${driverData.data.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Driver login FAILED:');
      console.log(`   Status: ${driverResponse.status}`);
      console.log(`   Message: ${driverData.message}`);
    }

  } catch (error) {
    console.error('💥 ERROR:', error.message);
  }
};

testCompanyUserLogin();
