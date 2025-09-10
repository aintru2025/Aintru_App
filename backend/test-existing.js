const http = require('http');

console.log('🧪 Testing existing auth routes...\n');

// Test login route (should exist)
const testData = {
  email: 'test@test.com',
  phone: '+1234567890'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📤 Testing POST /api/auth/login');

const req = http.request(options, (res) => {
  console.log('📊 Response Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Response Body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 400 || res.statusCode === 401) {
        console.log('\n✅ Login route exists (returned expected error)');
      } else if (res.statusCode === 404) {
        console.log('\n❌ Login route not found - auth router not working');
      } else {
        console.log('\n⚠️ Login route responded with unexpected status:', res.statusCode);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});

req.write(postData);
req.end();


