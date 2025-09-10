// Test script to debug login issue
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');

async function testLogin() {
  console.log('🔍 Testing Login Issue...\n');
  
  try {
    // Connect to MongoDB using the same connection as the main server
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test email from the screenshot
    const testEmail = 'ygoswami3103@gmail.com';
    
    // Check if user exists
    console.log(`\n🔍 Looking for user: ${testEmail}`);
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found in database');
      console.log('💡 Possible issues:');
      console.log('   - User was not created successfully');
      console.log('   - Email verification required');
      console.log('   - Database connection issue');
      
      // List all users in database
      const allUsers = await User.find({}).select('email name isVerified createdAt');
      console.log('\n📊 All users in database:');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name}) - Verified: ${u.isVerified} - Created: ${u.createdAt}`);
      });
      
    } else {
      console.log('✅ User found in database');
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Verified: ${user.isVerified}`);
      console.log(`   - Has password: ${!!user.password}`);
      console.log(`   - Created: ${user.createdAt}`);
      
      // Test password (you'll need to provide the password)
      console.log('\n🔑 To test password, run:');
      console.log('   node test-login.js <password>');
      
      if (process.argv[2]) {
        const testPassword = process.argv[2];
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log(`\n🔐 Password test: ${isMatch ? '✅ Match' : '❌ No match'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testLogin().catch(console.error); 