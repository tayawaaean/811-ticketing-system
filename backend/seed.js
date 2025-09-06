const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config/config');
const User = require('./models/User');

// Demo accounts data
const demoAccounts = [
  // Admin account
  {
    email: 'admin@novaunderground.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'Admin',
    isActive: true
  },
  // Contractor accounts
  {
    email: 'contractor1@example.com',
    password: 'contractor123',
    firstName: 'John',
    lastName: 'Smith',
    role: 'Contractor',
    isActive: true
  },
  {
    email: 'contractor2@example.com',
    password: 'contractor123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Contractor',
    isActive: true
  },
  {
    email: 'contractor3@example.com',
    password: 'contractor123',
    firstName: 'Mike',
    lastName: 'Williams',
    role: 'Contractor',
    isActive: true
  },
  {
    email: 'contractor4@example.com',
    password: 'contractor123',
    firstName: 'Emily',
    lastName: 'Brown',
    role: 'Contractor',
    isActive: true
  },
  {
    email: 'contractor5@example.com',
    password: 'contractor123',
    firstName: 'David',
    lastName: 'Davis',
    role: 'Contractor',
    isActive: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Clear existing users
const clearUsers = async () => {
  try {
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');
  } catch (error) {
    console.error('❌ Error clearing users:', error.message);
    throw error;
  }
};

// Create demo accounts
const createDemoAccounts = async () => {
  try {
    console.log('👥 Creating demo accounts...');
    
    for (const accountData of demoAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: accountData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${accountData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = new User(accountData);
      await user.save();
      
      console.log(`✅ Created ${accountData.role}: ${accountData.email} (${accountData.firstName} ${accountData.lastName})`);
    }
    
    console.log('🎉 All demo accounts created successfully!');
  } catch (error) {
    console.error('❌ Error creating demo accounts:', error.message);
    throw error;
  }
};

// Display created accounts
const displayAccounts = async () => {
  try {
    const users = await User.find({}).select('email firstName lastName role isActive');
    
    console.log('\n📋 Created Accounts:');
    console.log('==================');
    
    users.forEach(user => {
      console.log(`${user.role}: ${user.email} (${user.firstName} ${user.lastName}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
    
    console.log('\n🔑 Login Credentials:');
    console.log('====================');
    console.log('Admin: admin@novaunderground.com / admin123');
    console.log('Contractors: contractor1@example.com / contractor123');
    console.log('                 contractor2@example.com / contractor123');
    console.log('                 contractor3@example.com / contractor123');
    console.log('                 contractor4@example.com / contractor123');
    console.log('                 contractor5@example.com / contractor123');
    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error displaying accounts:', error.message);
  }
};

// Main seed function
const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await connectDB();
    
    // Clear existing users
    await clearUsers();
    
    // Create demo accounts
    await createDemoAccounts();
    
    // Display created accounts
    await displayAccounts();
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed, demoAccounts };
