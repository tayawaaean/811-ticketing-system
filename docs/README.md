# 📚 Documentation - Nova811 Ticketing System

Comprehensive documentation for the Nova811 underground utility ticketing management system.

## 📖 Table of Contents

- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment Guide](#deployment-guide)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🔌 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Authenticate a user and return a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Contractor"
    }
  }
}
```

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "Contractor"
}
```

### Ticket Endpoints

#### GET /api/tickets
Retrieve all tickets with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of tickets per page
- `status` (string): Filter by ticket status
- `assignedTo` (string): Filter by assigned user
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ticket_id",
      "ticketNumber": "TKT-2025-001",
      "organization": "Test Company",
      "status": "Open",
      "location": "123 Main St, City, State",
      "expirationDate": "2025-12-31T23:59:59.000Z",
      "assignedTo": {
        "id": "user_id",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### POST /api/tickets
Create a new ticket.

**Request Body:**
```json
{
  "organization": "Test Company",
  "location": "123 Main St, City, State 12345",
  "notes": "Test ticket description",
  "expirationDate": "2025-12-31T23:59:59.000Z",
  "assignedTo": "user_id",
  "coordinates": {
    "latitude": 40.7589,
    "longitude": -73.9851
  },
  "addressData": {
    "streetAddress": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "United States"
  }
}
```

#### PUT /api/tickets/:id
Update an existing ticket.

#### DELETE /api/tickets/:id
Delete a ticket (Admin only).

#### POST /api/tickets/import
Import multiple tickets from JSON data.

**Request Body:**
```json
{
  "tickets": [
    {
      "ticketNumber": "TKT-2025-001",
      "organization": "Test Company",
      "status": "Open",
      "location": "123 Main St, City, State",
      "expirationDate": "2025-12-31T23:59:59.000Z"
    }
  ],
  "overwriteExisting": false
}
```

### Alert Endpoints

#### GET /api/alerts
Retrieve user alerts.

#### PUT /api/alerts/:id/read
Mark an alert as read.

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['Admin', 'Contractor'], default: 'Contractor'),
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Tickets Collection

```javascript
{
  _id: ObjectId,
  ticketNumber: String (unique, required),
  organization: String (required),
  status: String (enum: ['Open', 'Closed', 'Expired'], default: 'Open'),
  location: String (required),
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  addressData: {
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    fullAddress: String,
    shortAddress: String
  },
  notes: String,
  expirationDate: Date (required),
  assignedTo: ObjectId (ref: 'User'),
  renewals: [{
    date: Date,
    extendedBy: Number
  }],
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Alerts Collection

```javascript
{
  _id: ObjectId,
  type: String (required),
  message: String (required),
  ticketId: ObjectId (ref: 'Ticket'),
  userId: ObjectId (ref: 'User'),
  isRead: Boolean (default: false),
  createdAt: Date (default: Date.now)
}
```

## 🚀 Deployment Guide

### Production Environment Setup

1. **Server Requirements**
   - Node.js 18+
   - MongoDB 5.0+
   - Nginx (optional, for reverse proxy)
   - PM2 (for process management)

2. **Environment Configuration**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nova811_prod
   JWT_SECRET=your-production-secret-key
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Build and Deploy**
   ```bash
   # Build frontend
   cd frontend
   npm run build
   
   # Start backend
   cd ../backend
   npm start
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/nova811
       depends_on:
         - mongo
     
     mongo:
       image: mongo:5.0
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
   
   volumes:
     mongo_data:
   ```

## 🛠️ Development Guide

### Setting Up Development Environment

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/nova811-ticketing-system.git
   cd nova811-ticketing-system
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

### Code Style Guidelines

1. **JavaScript/React**
   - Use functional components with hooks
   - Follow Material-UI component patterns
   - Use meaningful variable and function names
   - Add PropTypes for component validation

2. **Backend/Node.js**
   - Use async/await for asynchronous operations
   - Follow RESTful API conventions
   - Implement proper error handling
   - Add comprehensive logging

3. **Database**
   - Use descriptive field names
   - Implement proper indexing
   - Follow MongoDB best practices
   - Add data validation

### Testing Guidelines

1. **Unit Tests**
   - Test individual functions and components
   - Mock external dependencies
   - Achieve high code coverage

2. **Integration Tests**
   - Test API endpoints
   - Test database operations
   - Test authentication flows

3. **End-to-End Tests**
   - Test complete user workflows
   - Test cross-browser compatibility
   - Test mobile responsiveness

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill the process
   kill -9 <PID>
   ```

3. **CORS Errors**
   - Check CORS_ORIGIN in backend .env
   - Ensure frontend URL is included
   - Verify API URL in frontend .env

4. **JWT Token Issues**
   - Check JWT_SECRET in backend .env
   - Verify token expiration settings
   - Clear localStorage and re-login

### Debug Mode

1. **Backend Debug**
   ```bash
   DEBUG=app:* npm run dev
   ```

2. **Frontend Debug**
   ```bash
   # Enable React DevTools
   # Add console.log statements
   # Use browser developer tools
   ```

### Performance Issues

1. **Database Optimization**
   - Add proper indexes
   - Use aggregation pipelines
   - Implement connection pooling

2. **Frontend Optimization**
   - Use React.memo for components
   - Implement code splitting
   - Optimize bundle size

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Pull Request Guidelines

1. **Code Quality**
   - Follow existing code style
   - Add comments for complex logic
   - Ensure all tests pass

2. **Documentation**
   - Update README files
   - Add API documentation
   - Include code examples

3. **Testing**
   - Add unit tests
   - Test edge cases
   - Verify cross-browser compatibility

### Issue Reporting

When reporting issues, please include:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots (if applicable)

## 📞 Support

For additional support:
- Check existing issues on GitHub
- Review the documentation
- Contact the development team
- Join the community discussions

---

**Nova811 Ticketing System Documentation** 📚
