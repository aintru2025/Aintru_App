async function testInterviewFlow() {
  try {
    // Step 1: Login to get token
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ygoswami3103@gmail.com', password: 'password123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Step 2: Test interview flow generation
    console.log('🔄 Step 2: Testing interview flow generation...');
    const flowResponse = await fetch('http://localhost:3000/api/interviewFlow/generate-interview-flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        company: 'Apple',
        role: 'Software Engineer',
        experience: '0-1 years'
      })
    });
    
    const flowData = await flowResponse.json();
    console.log('📊 Interview flow response:', flowData);
    
    if (flowResponse.ok) {
      console.log('✅ Interview flow generated successfully!');
    } else {
      console.log('❌ Interview flow generation failed:', flowData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testInterviewFlow(); 