require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all users
    const users = await User.find({}, 'email name createdAt');
    console.log('📊 Found users:', users.length);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Name: ${user.name}, Created: ${user.createdAt}`);
      });
    } else {
      console.log('❌ No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkUsers();

