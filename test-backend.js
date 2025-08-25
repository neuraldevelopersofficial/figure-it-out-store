const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  try {
    console.log('🧪 Testing Backend Endpoints...\n');

    // Test carousels endpoint
    console.log('1. Testing carousels endpoint...');
    try {
      const carouselsResponse = await axios.get(`${BASE_URL}/carousels`);
      console.log('✅ Carousels endpoint working:', carouselsResponse.data.success);
    } catch (error) {
      console.log('❌ Carousels endpoint failed:', error.message);
    }

    // Test hero carousel
    console.log('\n2. Testing hero carousel...');
    try {
      const heroResponse = await axios.get(`${BASE_URL}/carousels/hero`);
      console.log('✅ Hero carousel working:', heroResponse.data.success);
      console.log('   Slides count:', heroResponse.data.carousel.slides.length);
    } catch (error) {
      console.log('❌ Hero carousel failed:', error.message);
    }

    // Test promo carousel
    console.log('\n3. Testing promo carousel...');
    try {
      const promoResponse = await axios.get(`${BASE_URL}/carousels/promo`);
      console.log('✅ Promo carousel working:', promoResponse.data.success);
      console.log('   Slides count:', promoResponse.data.carousel.slides.length);
    } catch (error) {
      console.log('❌ Promo carousel failed:', error.message);
    }

    // Test admin stats (without auth - should fail)
    console.log('\n4. Testing admin stats (should fail without auth)...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/admin/stats`);
      console.log('❌ Admin stats should have failed but succeeded');
    } catch (error) {
      console.log('✅ Admin stats correctly failed without auth:', error.response?.status);
    }

    console.log('\n🎉 Backend test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testBackend();
}

module.exports = { testBackend };
