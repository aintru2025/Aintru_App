const mongoose = require('mongoose');
const Waitlist = require('./models/waitlist');
const User = require('./models/user');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aintru', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testWaitlistFlow() {
  try {
    console.log('🧪 Testing Aintru Waitlist Authentication Flow...\n');
    
    // Test 1: Check if test user exists in waitlist
    const existingWaitlistUser = await Waitlist.findOne({ email: 'test@aintru.com' });
    
    if (existingWaitlistUser) {
      console.log('✅ Test user found in waitlist:');
      console.log('   📧 Email:', existingWaitlistUser.email);
      console.log('   📱 Phone:', existingWaitlistUser.phone);
      console.log('   👤 Name:', existingWaitlistUser.name);
      console.log('   📅 Joined:', existingWaitlistUser.joinedAt);
      console.log('   📊 Status:', existingWaitlistUser.status);
    } else {
      console.log('❌ No test user found in waitlist');
      console.log('💡 Creating test waitlist user...');
      
      // Create test waitlist user
      const testWaitlistUser = new Waitlist({
        name: 'Test User',
        email: 'test@aintru.com',
        phone: '+1234567890',
        status: 'waiting'
      });
      
      await testWaitlistUser.save();
      console.log('✅ Test waitlist user created successfully!');
      console.log('   📧 Email:', testWaitlistUser.email);
      console.log('   📱 Phone:', testWaitlistUser.phone);
      console.log('   👤 Name:', testWaitlistUser.name);
    }
    
    // Test 2: Check if user exists in users collection
    const existingUser = await User.findOne({ email: 'test@aintru.com' });
    
    if (existingUser) {
      console.log('\n✅ Test user found in users collection:');
      console.log('   📧 Email:', existingUser.email);
      console.log('   📱 Phone:', existingUser.phone);
      console.log('   👤 Name:', existingUser.name);
      console.log('   ✅ Verified:', existingUser.isVerified);
      console.log('   📅 Last Activity:', existingUser.lastActivity);
      
      if (existingUser.surname) {
        console.log('   🏷️ Surname:', existingUser.surname);
      }
      if (existingUser.educationLevel) {
        console.log('   🎓 Education:', existingUser.educationLevel);
      }
      if (existingUser.userType) {
        console.log('   👥 User Type:', existingUser.userType);
      }
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
      console.log('\n❌ No test user found in users collection');
      console.log('💡 User needs to complete the Get Started → Onboarding flow');
    }
    
    // Test 3: Check database connection
    console.log('\n🔌 Database Connection:');
    console.log('   Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('   Database:', mongoose.connection.name);
    
    // Test 4: Show all waitlist users
    const allWaitlistUsers = await Waitlist.find({}).select('name email phone status joinedAt');
    console.log('\n📋 All Waitlist Users:');
    if (allWaitlistUsers.length === 0) {
      console.log('   No waitlist users found');
    } else {
      allWaitlistUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.status}`);
      });
    }
    
    // Test 5: Show all users
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
    console.error('❌ Error testing waitlist flow:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testWaitlistFlow();

