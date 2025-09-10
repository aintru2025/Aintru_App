const mongoose = require('mongoose');
const User = require('./models/user');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aintru', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAuthFlow() {
  try {
    console.log('🧪 Testing Aintru Authentication Flow...\n');
    
    // Test 1: Check if test user exists
    const existingUser = await User.findOne({ email: 'test@aintru.com' });
    
    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log('   📧 Email:', existingUser.email);
      console.log('   📱 Phone:', existingUser.phone);
      console.log('   🔐 Use this phone number as password to login');
      console.log('   👤 Name:', existingUser.name);
      console.log('   ✅ Verified:', existingUser.isVerified);
      console.log('   📅 Last Activity:', existingUser.lastActivity);
      
      if (existingUser.skills && existingUser.skills.length > 0) {
        console.log('   🎯 Skills:', existingUser.skills.join(', '));
      }
      if (existingUser.dreamRole) {
        console.log('   🎭 Dream Role:', existingUser.dreamRole);
      }
      if (existingUser.targetCompany) {
        console.log('   🏢 Target Company:', existingUser.targetCompany);
      }
    } else {
      console.log('❌ No test user found');
      console.log('💡 Run the Get Started flow to create a test user');
    }
    
    // Test 2: Check database connection
    console.log('\n🔌 Database Connection:');
    console.log('   Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('   Database:', mongoose.connection.name);
    
    // Test 3: Show all users
    const allUsers = await User.find({}).select('name email phone isVerified createdAt');
    console.log('\n👥 All Users in Database:');
    if (allUsers.length === 0) {
      console.log('   No users found');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.isVerified ? '✅ Verified' : '❌ Unverified'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing auth flow:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testAuthFlow();

