async function testExactRoutes() {
  try {
    console.log('🧪 Testing exact interviewFlow routes...');
    
    // Test 1: Check if the base path exists
    const baseResponse = await fetch('http://localhost:3000/api/interviewFlow');
    console.log('📊 Base path status:', baseResponse.status);
    
    // Test 2: Test route with exact path
    const testResponse = await fetch('http://localhost:3000/api/interviewFlow/test');
    console.log('📊 Test route status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test route working:', testData);
    } else {
      const testText = await testResponse.text();
      console.log('❌ Test route failed:', testText.substring(0, 200));
    }
    
    // Test 3: Check what routes are actually available
    console.log('🔍 Checking available routes...');
    const routesResponse = await fetch('http://localhost:3000/api/interviewFlow/generate-interview-flow', {
      method: 'GET' // Try GET instead of POST
    });
    console.log('📊 Generate flow GET status:', routesResponse.status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExactRoutes();
