// Simple password reset script
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  console.log('🔧 Resetting Password...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const email = 'ygoswami3103@gmail.com';
    const newPassword = 'password123'; // Simple password for testing
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log('\n💡 Try logging in with these credentials now!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

resetPassword().catch(console.error); 