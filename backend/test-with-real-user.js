async function testWithRealUser() {
  try {
    console.log('🔐 Testing with real user credentials...');
    
    // Step 1: Login with real user
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'ygoswami3103@gmail.com', 
        password: 'password123' // Try the default password
      })
    });
    
    console.log('📊 Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
      
      // Try the second user
      console.log('🔄 Trying second user...');
      const loginResponse2 = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'aintru19@gmail.com', 
          password: 'password123'
        })
      });
      
      console.log('📊 Login status (user 2):', loginResponse2.status);
      
      if (!loginResponse2.ok) {
        const loginError2 = await loginResponse2.text();
        console.log('❌ Login failed for both users:', loginError2);
        return;
      }
      
      const loginData2 = await loginResponse2.json();
      const token = loginData2.token;
      console.log('✅ Login successful with second user');
      
      // Test interview flow
      await testInterviewFlow(token);
    } else {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('✅ Login successful with first user');
      
      // Test interview flow
      await testInterviewFlow(token);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testInterviewFlow(token) {
  console.log('🎯 Testing interview flow with valid token...');
  
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
    console.log('✅ Interview flow success:', JSON.stringify(flowData, null, 2));
  } else {
    const flowError = await flowResponse.text();
    console.log('❌ Interview flow failed:', flowError);
  }
}

testWithRealUser();
