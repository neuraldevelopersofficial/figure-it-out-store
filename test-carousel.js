// Simple test script to check carousel API
const API_BASE = 'http://localhost:5000/api';

async function testCarouselAPI() {
  try {
    console.log('🧪 Testing carousel API...');
    
    // Test 1: Get all carousels
    console.log('\n1. Testing GET /carousels');
    const allResponse = await fetch(`${API_BASE}/carousels`);
    const allData = await allResponse.json();
    console.log('Status:', allResponse.status);
    console.log('Response:', JSON.stringify(allData, null, 2));
    
    // Test 2: Get hero carousel specifically
    console.log('\n2. Testing GET /carousels/hero');
    const heroResponse = await fetch(`${API_BASE}/carousels/hero`);
    const heroData = await heroResponse.json();
    console.log('Status:', heroResponse.status);
    console.log('Response:', JSON.stringify(heroData, null, 2));
    
    // Test 3: Check if images are accessible
    if (heroData.success && heroData.carousel) {
      console.log('\n3. Testing image accessibility...');
      for (const slide of heroData.carousel.slides) {
        const imageResponse = await fetch(`http://localhost:5000${slide.image}`);
        console.log(`Image ${slide.image}: ${imageResponse.status === 200 ? '✅ Accessible' : '❌ Not accessible'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCarouselAPI();

