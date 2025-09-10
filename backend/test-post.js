async function testPostRequest() {
  try {
    console.log('🧪 Testing POST request to generate-interview-flow...');
    
    // Simulate the exact request the frontend makes
    const response = await fetch('http://localhost:3000/api/interviewFlow/generate-interview-flow', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth but should show the route works
      },
      body: JSON.stringify({ 
        company: 'Test Company',
        role: 'Software Engineer',
        experience: '1-3 years'
      })
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText.substring(0, 300));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPostRequest();
