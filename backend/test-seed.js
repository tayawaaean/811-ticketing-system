const mongoose = require('mongoose');
const config = require('./config/config');
const User = require('./models/User');

// Test function to verify seed data
const testSeedData = async () => {
  try {
    console.log('🧪 Testing seed data...\n');
    
    // Connect to database
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Count users
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'Admin' });
    const contractorUsers = await User.countDocuments({ role: 'Contractor' });
    
    console.log(`📊 Database Statistics:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Admin Users: ${adminUsers}`);
    console.log(`   Contractor Users: ${contractorUsers}`);
    
    // List all users
    const users = await User.find({}).select('email firstName lastName role isActive');
    console.log('\n👥 All Users:');
    console.log('=============');
    users.forEach(user => {
      console.log(`${user.role}: ${user.email} (${user.firstName} ${user.lastName}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
    
    // Verify specific accounts exist
    const adminExists = await User.findOne({ email: 'admin@novaunderground.com' });
    const contractor1Exists = await User.findOne({ email: 'contractor1@example.com' });
    
    console.log('\n✅ Verification:');
    console.log(`   Admin account exists: ${adminExists ? 'Yes' : 'No'}`);
    console.log(`   Contractor1 account exists: ${contractor1Exists ? 'Yes' : 'No'}`);
    
    if (adminExists && contractor1Exists) {
      console.log('\n🎉 Seed data verification successful!');
    } else {
      console.log('\n❌ Seed data verification failed!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testSeedData();
}

module.exports = { testSeedData };
