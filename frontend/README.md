# 🎨 Frontend - Nova811 Ticketing System

A modern React.js frontend application for managing underground utility tickets with Material-UI design, interactive maps, and responsive layout.

![React](https://img.shields.io/badge/react-18+-blue.svg)
![Material-UI](https://img.shields.io/badge/material--ui-5.0+-blue.svg)
![Vite](https://img.shields.io/badge/vite-4.0+-purple.svg)
![TypeScript](https://img.shields.io/badge/typescript-4.9+-blue.svg)

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
│   └── vite.svg        # Vite logo
├── src/
│   ├── components/     # Reusable components
│   │   ├── AlertManagement.jsx
│   │   ├── ContractorProfile.jsx
│   │   ├── DashboardOverview.jsx
│   │   ├── ImportTickets.jsx
│   │   ├── LocationPicker.jsx
│   │   ├── TicketManagement.jsx
│   │   └── UserManagement.jsx
│   ├── contexts/       # React contexts
│   │   └── AuthContext.jsx
│   ├── hooks/          # Custom hooks
│   │   ├── useTickets.js
│   │   └── useUsers.js
│   ├── pages/          # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── ContractorDashboard.jsx
│   │   └── LoginPage.jsx
│   ├── utils/          # Utility functions
│   │   └── geocoding.js
│   ├── App.jsx         # Main app component
│   ├── App.css         # Global styles
│   ├── index.css       # Base styles
│   └── main.jsx        # Entry point
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── eslint.config.js    # ESLint configuration
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Backend API** running on port 5000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   ```
   http://localhost:3000
   ```

## 🎨 UI Components

### Core Components

#### 🏠 Dashboard Components
- **DashboardOverview**: Main dashboard with statistics and recent activity
- **AdminDashboard**: Admin-specific dashboard with full system access
- **ContractorDashboard**: Contractor dashboard with personal tickets

#### 🎫 Ticket Management
- **TicketManagement**: Complete ticket CRUD operations
- **ImportTickets**: Bulk ticket import with duplicate detection
- **LocationPicker**: Interactive map for location selection

#### 👥 User Management
- **UserManagement**: Admin user management interface
- **ContractorProfile**: Contractor profile management
- **AlertManagement**: Alert and notification management

### 🗺️ Map Integration

#### LocationPicker Component
```jsx
<LocationPicker
  open={isOpen}
  onClose={handleClose}
  onLocationSelect={handleLocationSelect}
  initialLocation={selectedLocation}
/>
```

**Features:**
- **Interactive maps** with React Leaflet
- **Forward geocoding** for address search
- **Reverse geocoding** for coordinate lookup
- **US address validation**
- **Coordinate storage** with formatted addresses

#### Geocoding Utilities
```javascript
// Forward geocoding
const result = await forwardGeocode("123 Main St, New York, NY");

// Reverse geocoding
const address = await reverseGeocode(40.7589, -73.9851);

// Location display
const display = getLocationDisplayString(ticket);
```

## 🎯 Features

### 🔐 Authentication
- **JWT-based authentication** with automatic token refresh
- **Role-based routing** (Admin/Contractor)
- **Protected routes** with authentication guards
- **Login/logout** with persistent sessions

### 📱 Responsive Design
- **Mobile-first approach** with Material-UI breakpoints
- **Touch-friendly interfaces** for mobile devices
- **Adaptive layouts** for different screen sizes
- **Progressive Web App** capabilities

### 🎨 Material-UI Integration
- **Consistent design system** with MUI components
- **Custom theming** with brand colors
- **Accessibility compliance** with ARIA standards
- **Dark/light theme** support (configurable)

### 📊 Data Management
- **Real-time updates** with optimistic UI
- **Error handling** with user-friendly messages
- **Loading states** for better UX
- **Form validation** with instant feedback

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing (when implemented)
npm test             # Run tests
npm run test:coverage # Coverage report
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Nova811 Ticketing System
VITE_APP_VERSION=1.0.0

# Map Configuration
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=© OpenStreetMap contributors

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

## 🎨 Styling & Theming

### Material-UI Theme
```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});
```

### Custom Styles
- **Global styles** in `index.css`
- **Component styles** with Material-UI `sx` prop
- **Responsive breakpoints** for mobile/desktop
- **Custom CSS classes** for specific styling needs

## 📱 Responsive Design

### Breakpoints
```javascript
// Material-UI breakpoints
xs: 0px      // Extra small devices
sm: 600px    // Small devices
md: 900px    // Medium devices
lg: 1200px   // Large devices
xl: 1536px   // Extra large devices
```

### Mobile Features
- **Swipeable drawer** for navigation
- **Touch-friendly buttons** and inputs
- **Optimized layouts** for small screens
- **Gesture support** for map interactions

## 🗺️ Map Integration

### React Leaflet Setup
```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
```

### Map Features
- **Interactive markers** with popups
- **Location search** with autocomplete
- **Coordinate display** with precision
- **Address formatting** for US locations
- **Bounds validation** for US addresses

## 🔄 State Management

### Context API
```javascript
// AuthContext for user authentication
const { user, login, logout, loading } = useAuth();

// Custom hooks for data fetching
const { tickets, loading, error, refreshTickets } = useTickets();
const { users, createUser, updateUser, deleteUser } = useUsers();
```

### Local State
- **React hooks** for component state
- **Form state** with controlled components
- **Loading states** for async operations
- **Error handling** with user feedback

## 📊 Data Flow

### API Communication
```javascript
// Axios configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling
```javascript
// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      logout();
    }
    return Promise.reject(error);
  }
);
```

## 🧪 Testing

### Test Structure
```
src/
├── __tests__/         # Test files
│   ├── components/    # Component tests
│   ├── hooks/         # Hook tests
│   └── utils/         # Utility tests
├── test-utils/        # Test utilities
└── mocks/            # Mock data
```

### Testing Tools
- **Jest** for unit testing
- **React Testing Library** for component testing
- **MSW** for API mocking
- **Cypress** for E2E testing (optional)

## 🚀 Performance Optimization

### Code Splitting
```javascript
// Lazy loading components
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ContractorDashboard = lazy(() => import('./pages/ContractorDashboard'));
```

### Bundle Optimization
- **Tree shaking** for unused code removal
- **Dynamic imports** for code splitting
- **Asset optimization** with Vite
- **Caching strategies** for static assets

### Performance Monitoring
- **Bundle analyzer** for size optimization
- **Lighthouse** for performance auditing
- **React DevTools** for component profiling
- **Network monitoring** for API optimization

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check backend CORS configuration
   # Ensure frontend URL is in CORS_ORIGIN
   ```

2. **Map Not Loading**
   ```bash
   # Check Leaflet CSS import
   import 'leaflet/dist/leaflet.css';
   ```

3. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode
```bash
# Enable React DevTools
npm install --save-dev @types/react

# Enable Vite debug
DEBUG=vite:* npm run dev
```

## 📚 Component Examples

### Login Form
```jsx
<TextField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  fullWidth
  margin="normal"
  required
/>
```

### Data Table
```jsx
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Ticket Number</TableCell>
        <TableCell>Organization</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {tickets.map((ticket) => (
        <TableRow key={ticket._id}>
          <TableCell>{ticket.ticketNumber}</TableCell>
          <TableCell>{ticket.organization}</TableCell>
          <TableCell>
            <Chip label={ticket.status} color="primary" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

### Interactive Map
```jsx
<MapContainer center={[40.7589, -73.9851]} zoom={13}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='© OpenStreetMap contributors'
  />
  <Marker position={[40.7589, -73.9851]}>
    <Popup>
      <strong>Ticket Location</strong><br />
      123 Main Street, New York, NY
    </Popup>
  </Marker>
</MapContainer>
```

## 🤝 Contributing

1. Follow the existing code style
2. Add PropTypes for component validation
3. Write tests for new components
4. Update documentation
5. Ensure responsive design
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Frontend for Nova811 Ticketing System** 🎨