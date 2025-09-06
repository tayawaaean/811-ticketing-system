# Database Seeding

This directory contains scripts to seed the database with demo data for testing and development.

## Seed File: `seed.js`

The seed file creates demo admin and contractor accounts for testing the application.

### What it creates:
- **1 Admin account**: `admin@novaunderground.com`
- **5 Contractor accounts**: `contractor1@example.com` through `contractor5@example.com`

### Demo Accounts:

| Role | Email | Password | Name |
|------|-------|----------|------|
| Admin | admin@novaunderground.com | admin123 | System Administrator |
| Contractor | contractor1@example.com | contractor123 | John Smith |
| Contractor | contractor2@example.com | contractor123 | Sarah Johnson |
| Contractor | contractor3@example.com | contractor123 | Mike Williams |
| Contractor | contractor4@example.com | contractor123 | Emily Brown |
| Contractor | contractor5@example.com | contractor123 | David Davis |

## How to Run

### Prerequisites
1. Make sure MongoDB is running
2. Ensure the backend dependencies are installed: `npm install`
3. Set up your environment variables (copy `.env.example` to `.env`)

### Running the Seed Script

```bash
# Navigate to the backend directory
cd backend

# Run the seed script
npm run seed

# Or run directly with node
node seed.js
```

### What happens when you run it:
1. ✅ Connects to MongoDB
2. 🗑️ Clears existing users (if any)
3. 👥 Creates all demo accounts
4. 📋 Displays created accounts
5. 🔑 Shows login credentials
6. 🔌 Closes database connection

## Features

- **Safe execution**: Checks for existing users before creating
- **Password hashing**: Automatically hashes passwords using bcrypt
- **Error handling**: Comprehensive error handling and logging
- **Clear output**: Shows exactly what accounts were created
- **Database cleanup**: Clears existing users before seeding

## Customization

To modify the demo accounts, edit the `demoAccounts` array in `seed.js`:

```javascript
const demoAccounts = [
  {
    email: 'your-email@example.com',
    password: 'your-password',
    firstName: 'Your',
    lastName: 'Name',
    role: 'Admin', // or 'Contractor'
    isActive: true
  },
  // ... add more accounts
];
```

## Notes

- All passwords are automatically hashed using bcrypt
- The script is safe to run multiple times
- Existing users with the same email will be skipped
- The script only creates user accounts (no tickets or alerts)
