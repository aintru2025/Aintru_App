async function testRouter() {
  try {
    console.log('🧪 Testing router...');
    
    // Test 1: Simple GET route
    const testResponse = await fetch('http://localhost:3000/api/interviewFlow/test');
    const responseText = await testResponse.text();
    console.log('📊 Response status:', testResponse.status);
    console.log('📊 Response headers:', testResponse.headers);
    console.log('📊 Response text:', responseText.substring(0, 200) + '...');
    
    if (testResponse.ok) {
      console.log('✅ Router is working!');
    } else {
      console.log('❌ Router test failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRouter(); 