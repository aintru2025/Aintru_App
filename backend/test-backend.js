const http = require('http');

// Test backend connectivity
function testBackend() {
  console.log('🧪 Testing Backend Connectivity...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log('✅ Backend is running!');
    console.log('   📍 URL: http://localhost:3000');
    console.log('   📊 Status:', res.statusCode);
    console.log('   🔗 Health endpoint: /health');
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const healthData = JSON.parse(data);
        console.log('   🗄️ Database:', healthData.database);
        console.log('   ⏰ Uptime:', Math.round(healthData.uptime), 'seconds');
        console.log('   🌍 Environment:', healthData.environment);
      } catch (e) {
        console.log('   📄 Response:', data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log('❌ Backend is NOT running!');
    console.log('   🔌 Error:', err.message);
    console.log('\n💡 To start the backend:');
    console.log('   cd Aintru_App/backend');
    console.log('   npm start');
  });
  
  req.end();
}

// Test auth endpoint specifically
function testAuthEndpoint() {
  console.log('\n🔐 Testing Auth Endpoint...\n');
  
  const postData = JSON.stringify({
    name: 'Test User',
    email: 'test@aintru.com',
    phone: '+1234567890'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/verify-credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('✅ Auth endpoint is accessible!');
    console.log('   📍 URL: /api/auth/verify-credentials');
    console.log('   📊 Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const responseData = JSON.parse(data);
        console.log('   📄 Response:', responseData);
      } catch (e) {
        console.log('   📄 Raw Response:', data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log('❌ Auth endpoint is NOT accessible!');
    console.log('   🔌 Error:', err.message);
  });
  
  req.write(postData);
  req.end();
}

// Run tests
testBackend();
setTimeout(testAuthEndpoint, 1000); // Wait 1 second before testing auth endpoint


