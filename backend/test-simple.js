const http = require('http');

console.log('🧪 Testing simple auth route...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/test',
  method: 'GET'
};

console.log('📤 Sending GET request to:', options.path);

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
      
      if (res.statusCode === 200) {
        console.log('\n✅ Simple route is working! Auth router is properly loaded.');
      } else {
        console.log('\n⚠️ Simple route responded with status:', res.statusCode);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});

req.end(); 