# 🚀 Backend API - Nova811 Ticketing System

A robust Node.js/Express.js backend API for managing underground utility tickets with authentication, expiration tracking, and automated alerts.

![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Express.js](https://img.shields.io/badge/express.js-4.18+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-5.0+-green.svg)
![JWT](https://img.shields.io/badge/jwt-authentication-orange.svg)

## 📁 Project Structure

```
backend/
├── config/           # Configuration files
│   └── config.js     # Main configuration
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── ticketController.js
│   └── alertController.js
├── middlewares/      # Custom middleware
│   ├── auth.js       # Authentication middleware
│   ├── validation.js # Request validation
│   └── errorHandler.js
├── models/          # Database models
│   ├── User.js      # User schema
│   ├── Ticket.js    # Ticket schema
│   └── Alert.js     # Alert schema
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── tickets.js   # Ticket routes
│   └── alerts.js    # Alert routes
├── utils/           # Utility functions
│   ├── logger.js    # Winston logging
│   └── expirationMonitor.js
├── logs/            # Log files
├── server.js        # Main server file
├── seed.js          # Database seeding
└── package.json     # Dependencies
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** 5.0+ (local or cloud)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

4. **Seed database**
   ```bash
   npm run seed
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nova811

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10

# Admin Default Account
ADMIN_EMAIL=admin@novaunderground.com
ADMIN_PASSWORD=admin123
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | User registration | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/auth/users` | Get all users (Admin) | Admin |

### Ticket Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tickets` | Get all tickets | Yes |
| GET | `/tickets/:id` | Get ticket by ID | Yes |
| POST | `/tickets` | Create ticket | Yes |
| PUT | `/tickets/:id` | Update ticket | Yes |
| DELETE | `/tickets/:id` | Delete ticket | Admin |
| PUT | `/tickets/:id/renew` | Renew ticket | Yes |
| PUT | `/tickets/:id/close` | Close ticket | Yes |
| POST | `/tickets/import` | Import tickets | Yes |
| GET | `/tickets/stats/overview` | Get ticket statistics | Yes |

### Alert Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/alerts` | Get user alerts | Yes |
| PUT | `/alerts/:id/read` | Mark alert as read | Yes |
| GET | `/alerts/unread-count` | Get unread count | Yes |

### Health Check Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/database` | Database health |
| GET | `/health/system` | System metrics |
| GET | `/health/comprehensive` | Full health check |

## 🔐 Authentication

### JWT Token Structure
```javascript
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "Admin|Contractor",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authorization Headers
```http
Authorization: Bearer <jwt_token>
```

## 📊 Database Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['Admin', 'Contractor']),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket Model
```javascript
{
  ticketNumber: String (unique, required),
  organization: String (required),
  status: String (enum: ['Open', 'Closed', 'Expired']),
  location: String (required),
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  addressData: Object,
  notes: String,
  expirationDate: Date (required),
  assignedTo: ObjectId (ref: 'User'),
  renewals: [{
    date: Date,
    extendedBy: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Alert Model
```javascript
{
  type: String (required),
  message: String (required),
  ticketId: ObjectId (ref: 'Ticket'),
  userId: ObjectId (ref: 'User'),
  isRead: Boolean (default: false),
  createdAt: Date
}
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start with nodemon

# Production
npm start            # Start production server

# Database
npm run seed         # Seed with demo data
npm run test-seed    # Test seed data

# Testing
npm test             # Run tests (when implemented)
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based authentication** with configurable expiration
- **Role-based access control** (Admin/Contractor)
- **Password hashing** using bcrypt with salt rounds
- **Rate limiting** to prevent abuse
- **CORS protection** with configurable origins

### Input Validation
- **Request validation** using express-validator
- **Data sanitization** to prevent injection attacks
- **Schema validation** for all API endpoints
- **File upload validation** for import functionality

### Error Handling
- **Centralized error handling** with custom error classes
- **Detailed logging** with Winston logger
- **Security headers** using Helmet.js
- **Request compression** for performance

## 📝 Logging

### Log Levels
- **error**: Error messages
- **warn**: Warning messages
- **info**: General information
- **debug**: Debug information

### Log Files
- `logs/error.log`: Error logs only
- `logs/all.log`: All log levels
- Console output in development

### Log Format
```javascript
{
  timestamp: '2025-09-07T10:30:00.000Z',
  level: 'info',
  message: 'User logged in successfully',
  userId: '507f1f77bcf86cd799439011',
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0...'
}
```

## 🔄 Scheduled Tasks

### Expiration Monitor
- **Runs every hour** to check ticket expirations
- **Creates alerts** for tickets expiring within 48 hours
- **Updates status** to 'Expired' for overdue tickets
- **Logs all activities** for audit trail

### Configuration
```javascript
// Check every hour
cron.schedule('0 * * * *', async () => {
  await checkExpiringTickets();
  await checkExpiredTickets();
});
```

## 🚀 Performance Optimization

### Database
- **Indexes** on frequently queried fields
- **Connection pooling** for MongoDB
- **Query optimization** with proper projections
- **Aggregation pipelines** for complex queries

### Caching
- **Response caching** for static data
- **Session caching** for user data
- **Query result caching** for expensive operations

### Monitoring
- **Health check endpoints** for monitoring
- **Performance metrics** collection
- **Error rate monitoring**
- **Response time tracking**

## 🧪 Testing

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📈 Monitoring & Health Checks

### Health Check Endpoints
- **Basic**: `/api/health` - Simple status check
- **Database**: `/api/health/database` - MongoDB connectivity
- **System**: `/api/health/system` - System metrics
- **Comprehensive**: `/api/health/comprehensive` - Full system check

### Metrics Collected
- **Database connection status**
- **Memory usage**
- **CPU usage**
- **Response times**
- **Error rates**
- **Active connections**

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   mongod --version
   
   # Start MongoDB
   mongod
   ```

2. **JWT Secret Error**
   ```bash
   # Generate a new JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill the process
   kill -9 <PID>
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=app:* npm run dev

# Enable specific debug categories
DEBUG=app:auth,app:database npm run dev
```

## 📚 API Examples

### Login Request
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@novaunderground.com",
  "password": "admin123"
}
```

### Create Ticket Request
```javascript
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "organization": "Test Company",
  "location": "123 Main St, City, State 12345",
  "notes": "Test ticket",
  "expirationDate": "2025-12-31T23:59:59.000Z"
}
```

### Import Tickets Request
```javascript
POST /api/tickets/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "tickets": [...],
  "overwriteExisting": false
}
```

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Backend API for Nova811 Ticketing System** 🚧