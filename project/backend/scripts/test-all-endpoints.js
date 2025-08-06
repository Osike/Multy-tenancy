import fetch from 'node-fetch';

// Replace this with your actual token from login
const TOKEN = 'YOUR_TOKEN_HERE';

const baseURL = 'http://localhost:5000/api';

const testEndpoints = [
  { name: 'Companies', url: '/companies' },
  { name: 'Users', url: '/users' },
  { name: 'Trucks', url: '/trucks' },
  { name: 'Customers', url: '/customers' },
  { name: 'Trips', url: '/trips' }
];

const testAPI = async () => {
  console.log('🧪 Testing all API endpoints...\n');

  for (const endpoint of testEndpoints) {
    try {
      console.log(`📡 Testing ${endpoint.name}...`);
      
      const response = await fetch(`${baseURL}${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data count: ${data.data ? data.data.length || 0 : 0}\n`);
      } else {
        console.log(`❌ ${endpoint.name}: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Message: ${data.message}\n`);
      }
    } catch (error) {
      console.log(`💥 ${endpoint.name}: ERROR`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
  
  console.log('🎉 API testing completed!');
};

// Run the test
testAPI();
