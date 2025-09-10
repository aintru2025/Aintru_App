async function testHealth() {
  try {
    console.log('🏥 Testing server health...');
    
    // Test 1: Health endpoint
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthText = await healthResponse.text();
    console.log('📊 Health status:', healthResponse.status);
    console.log('📊 Health text:', healthText.substring(0, 200) + '...');
    
    // Test 2: Root endpoint
    const rootResponse = await fetch('http://localhost:3000/');
    const rootText = await rootResponse.text();
    console.log('📊 Root status:', rootResponse.status);
    console.log('📊 Root text:', rootText.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHealth(); 