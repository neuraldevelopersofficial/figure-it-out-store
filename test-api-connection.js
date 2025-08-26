// Simple script to test API connectivity
const fetch = require('node-fetch');

// Configuration
const API_URL = 'https://api.figureitoutstore.in/api';
const ENDPOINTS = [
  '/products',
  '/carousels/hero',
  '/carousels/promo'
];

// Test function
async function testApiEndpoint(endpoint) {
  const url = `${API_URL}${endpoint}`;
  console.log(`Testing endpoint: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Status: ${response.status}`);
      console.log(`Data received: ${JSON.stringify(data).substring(0, 100)}...`);
      return true;
    } else {
      console.log(`❌ Error! Status: ${response.status}`);
      console.log(`Response: ${await response.text()}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
    return false;
  }
}

// Main function
async function runTests() {
  console.log('=== API Connection Test ===');
  console.log(`Testing API at: ${API_URL}\n`);
  
  let successCount = 0;
  
  for (const endpoint of ENDPOINTS) {
    const success = await testApiEndpoint(endpoint);
    if (success) successCount++;
    console.log('----------------------------');
  }
  
  console.log(`\nTest Summary: ${successCount}/${ENDPOINTS.length} endpoints successful`);
  
  if (successCount === 0) {
    console.log('\n🔍 Troubleshooting Tips:');
    console.log('1. Check your DNS settings in GoDaddy');
    console.log('2. Verify your backend is deployed and running on Render');
    console.log('3. Ensure your domain is properly configured in Render');
    console.log('4. DNS changes may take time to propagate (up to 48 hours)');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
});