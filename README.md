# 🚧 Nov811 Ticketing System

A comprehensive underground utility ticketing management system built with React, Node.js, and MongoDB. This system manages 811 tickets with authentication, expiration tracking, renewals, and automated alerts.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-5.0+-green.svg)

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure JWT-based authentication** with role-based access control
- **Admin and Contractor roles** with different permissions
- **Password hashing** using bcrypt for security
- **Session management** with configurable expiration

### 🎫 Ticket Management
- **Complete CRUD operations** for tickets
- **Role-based ticket access** (contractors see only their own, admins see all)
- **Ticket renewal system** with 15-day extensions
- **Status tracking** (Open, Closed, Expired)
- **Bulk operations** with import/export functionality

### 📍 Location Services
- **Interactive maps** with React Leaflet
- **Forward and reverse geocoding** using OpenStreetMap
- **Coordinate storage** with formatted addresses
- **Location validation** for US addresses
- **Address autocomplete** and search functionality

### ⏰ Expiration & Alerts
- **Automated expiration monitoring** with scheduled checks
- **Real-time alerts** for tickets expiring within 48 hours
- **Automatic status updates** for expired tickets
- **Alert management** with mark-as-read functionality
- **Dashboard notifications** with unread count

### 📊 Analytics & Reporting
- **Comprehensive dashboard** with key metrics
- **Ticket statistics** (total, open, closed, expired)
- **Expiration tracking** with visual indicators
- **User activity monitoring** and audit logs
- **Export capabilities** for reporting

### 🔄 Import/Export System
- **JSON-based import** with duplicate detection
- **Sample data generation** for testing
- **Bulk ticket creation** with validation
- **Role-specific sample data** (admin vs contractor)
- **Overwrite options** for existing tickets

### 🎨 Modern UI/UX
- **Material-UI design system** with responsive layout
- **Dark/light theme support** (configurable)
- **Mobile-first design** with touch-friendly interfaces
- **Real-time updates** with optimistic UI
- **Accessibility compliance** with ARIA standards

## 🏗️ Architecture

```
├── frontend/          # React.js frontend application
├── backend/           # Node.js/Express.js backend API
├── docs/             # Documentation and guides
└── README.md         # This file
```

### Frontend Stack
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Axios** for API communication
- **React Leaflet** for map integration
- **Vite** for build tooling

### Backend Stack
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Winston** for logging
- **Swagger** for API documentation
- **Node-cron** for scheduled tasks

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** 5.0+ (local or cloud)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nova811-ticketing-system.git
   cd nova811-ticketing-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   
   # Edit backend/.env with your configuration
   MONGODB_URI=mongodb://localhost:27017/nova811
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

4. **Database setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed the database with demo data
   cd backend
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@novaunderground.com | admin123 |
| Contractor | contractor1@example.com | contractor123 |
| Contractor | contractor2@example.com | contractor123 |
| Contractor | contractor3@example.com | contractor123 |
| Contractor | contractor4@example.com | contractor123 |
| Contractor | contractor5@example.com | contractor123 |

## 📱 Usage

### For Administrators
- **Dashboard Overview**: View system statistics and recent activity
- **All Tickets**: Manage all tickets in the system
- **User Management**: Create and manage contractor accounts
- **Import Tickets**: Bulk import tickets from JSON files
- **Alerts**: Monitor and manage system alerts

### For Contractors
- **My Overview**: Personal dashboard with assigned tickets
- **My Tickets**: View and manage assigned tickets
- **Import Tickets**: Import tickets (auto-assigned to contractor)
- **My Profile**: Update personal information
- **My Alerts**: View personal notifications

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with demo data
npm run test-seed  # Test seed data
```

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| GET | `/api/tickets` | Get all tickets | Yes |
| POST | `/api/tickets` | Create ticket | Yes |
| PUT | `/api/tickets/:id` | Update ticket | Yes |
| DELETE | `/api/tickets/:id` | Delete ticket | Admin only |
| POST | `/api/tickets/import` | Import tickets | Yes |
| GET | `/api/alerts` | Get alerts | Yes |
| PUT | `/api/alerts/:id/read` | Mark alert as read | Yes |

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nova811

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX=100
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Nova811 Ticketing System
```

## 📊 Database Schema

### Users Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: ['Admin', 'Contractor'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Tickets Collection
```javascript
{
  ticketNumber: String (unique),
  organization: String,
  status: ['Open', 'Closed', 'Expired'],
  location: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  addressData: Object,
  notes: String,
  expirationDate: Date,
  assignedTo: ObjectId (User),
  renewals: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Alerts Collection
```javascript
{
  type: String,
  message: String,
  ticketId: ObjectId,
  userId: ObjectId,
  isRead: Boolean,
  createdAt: Date
}
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
npm start
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api-docs`

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Integration with external 811 systems
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Multi-tenant support

---

**Built with ❤️ for underground utility management**
