// Test script for role suggestions endpoint
async function testRoleSuggestions() {
  try {
    console.log('💼 Testing role suggestions...');
    
    // Step 1: Login to get a valid token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'ygoswami3103@gmail.com', 
        password: 'password123' 
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Step 2: Test role suggestions
    const suggestionsResponse = await fetch('http://localhost:3000/api/interviewFlow/role-suggestions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query: 'software' })
    });
    
    console.log('📊 Role suggestions status:', suggestionsResponse.status);
    
    if (suggestionsResponse.ok) {
      const suggestionsData = await suggestionsResponse.json();
      console.log('✅ Role suggestions success:', suggestionsData);
    } else {
      const errorText = await suggestionsResponse.text();
      console.log('❌ Role suggestions failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRoleSuggestions();
