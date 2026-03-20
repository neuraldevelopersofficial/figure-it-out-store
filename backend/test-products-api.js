require('dotenv').config();
const axios = require('axios');

// Function to test the products API
async function testProductsAPI() {
  try {
    // Get the API URL from environment variables or use default
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    
    console.log(`Testing Products API at: ${apiUrl}`);
    
    // Test GET /api/products endpoint
    const response = await axios.get(`${apiUrl}/api/products`);
    
    // Check if the response is successful
    if (response.status === 200 && response.data.success) {
      const products = response.data.products;
      console.log('✅ Successfully connected to Products API');
      console.log(`✅ Retrieved ${products.length} products`);
      
      // Display the first 3 products (or fewer if less than 3 exist)
      const sampleSize = Math.min(3, products.length);
      console.log(`\nSample of ${sampleSize} products:`);
      
      for (let i = 0; i < sampleSize; i++) {
        const product = products[i];
        console.log(`\nProduct ${i + 1}:`);
        console.log(`- ID: ${product.id}`);
        console.log(`- Name: ${product.name}`);
        console.log(`- Price: ₹${product.price}`);
        console.log(`- Category: ${product.category}`);
        console.log(`- In Stock: ${product.in_stock ? 'Yes' : 'No'}`);
        console.log(`- Stock Quantity: ${product.stock_quantity}`);
      }
      
      console.log('\n✅ API test completed successfully!');
    } else {
      console.error('❌ API request failed with unexpected response:', response.data);
    }
  } catch (error) {
    console.error('❌ Error testing Products API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Check if the API is running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    console.error('\nTroubleshooting tips:');
    console.error('1. Make sure the backend server is running');
    console.error('2. Check that the API_URL environment variable is set correctly');
    console.error('3. Verify that the MongoDB connection is working');
    console.error('4. Ensure products have been imported to the database');
  }
}

// Run the test
testProductsAPI();