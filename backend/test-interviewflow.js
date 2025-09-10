async function testInterviewFlow() {
  try {
    console.log('🧪 Testing interviewFlow routes...');
    
    // Test 1: Test route (should work)
    const testResponse = await fetch('http://localhost:3000/api/interviewFlow/test');
    console.log('📊 Test route status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test route working:', testData);
    } else {
      const testText = await testResponse.text();
      console.log('❌ Test route failed:', testText.substring(0, 100));
    }
    
    // Test 2: Generate interview flow route (should require auth)
    const flowResponse = await fetch('http://localhost:3000/api/interviewFlow/generate-interview-flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: 'Test', role: 'Test', experience: '1' })
    });
    console.log('📊 Generate flow status:', flowResponse.status);
    
    if (flowResponse.status === 401) {
      console.log('✅ Generate flow route exists (requires auth)');
    } else {
      const flowText = await flowResponse.text();
      console.log('❌ Generate flow route issue:', flowText.substring(0, 100));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testInterviewFlow(); 