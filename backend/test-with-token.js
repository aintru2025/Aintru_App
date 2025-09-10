async function testWithValidToken() {
  try {
    console.log('🔐 Testing with valid token...');
    
    // Step 1: Login to get a valid token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@test.com', 
        password: 'password123' 
      })
    });
    
    console.log('📊 Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login successful, token received');
    
    // Step 2: Test interview flow with valid token
    const flowResponse = await fetch('http://localhost:3000/api/interviewFlow/generate-interview-flow', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        company: 'Test Company',
        role: 'Software Engineer',
        experience: '1-3 years'
      })
    });
    
    console.log('📊 Interview flow status:', flowResponse.status);
    
    if (flowResponse.ok) {
      const flowData = await flowResponse.json();
      console.log('✅ Interview flow success:', flowData);
    } else {
      const flowError = await flowResponse.text();
      console.log('❌ Interview flow failed:', flowError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithValidToken();
