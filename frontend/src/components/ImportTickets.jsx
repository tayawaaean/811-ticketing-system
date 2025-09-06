import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ImportTickets = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const steps = [
    'Select File',
    'Preview Data',
    'Handle Duplicates',
    'Import Results'
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setActiveStep(1);
      parseFile(file);
    }
  };

  const parseFile = async (file) => {
    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('File must contain an array of tickets');
      }

      setTicketsData(data);
      setActiveStep(1);
    } catch (err) {
      setError(`Error parsing file: ${err.message}`);
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicates = async () => {
    setLoading(true);
    try {
      const duplicateChecks = ticketsData.map(async (ticket) => {
        try {
          const response = await axios.get(`/tickets/check-number/${ticket.ticketNumber}`);
          return {
            ticket,
            isDuplicate: response.data.data.exists,
            existingTicket: response.data.data.existingTicket
          };
        } catch (error) {
          return {
            ticket,
            isDuplicate: false,
            error: error.message
          };
        }
      });

      const results = await Promise.all(duplicateChecks);
      const duplicatesFound = results.filter(result => result.isDuplicate);
      
      setDuplicates(duplicatesFound);
      setActiveStep(2);
    } catch (err) {
      setError(`Error checking duplicates: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/tickets/import', {
        tickets: ticketsData,
        overwriteExisting
      });

      setImportResults(response.data.data);
      setActiveStep(3);
    } catch (err) {
      setError(`Import failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleFile = () => {
    const isContractor = user?.role === 'Contractor';
    
    // Base date: September 7, 2025
    const baseDate = new Date('2025-09-07T00:00:00.000Z');
    
    // Helper function to create date
    const createDate = (daysFromBase) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + daysFromBase);
      return date.toISOString();
    };
    
    const sampleData = isContractor ? [
      // 5 Near Expiry Tickets (expiring within 48 hours)
      {
        "ticketNumber": "TKT-2025-001",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(1), // Tomorrow
        "location": "123 Main Street, Downtown, New York, NY 10001",
        "coordinates": { "latitude": 40.7589, "longitude": -73.9851 },
        "addressData": {
          "streetAddress": "123 Main Street",
          "city": "New York", "state": "NY", "zipCode": "10001",
          "country": "United States",
          "fullAddress": "123 Main Street, New York, NY 10001, United States",
          "shortAddress": "New York, NY, 10001"
        },
        "notes": "Building renovation project - electrical and plumbing work"
      },
      {
        "ticketNumber": "TKT-2025-002",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(2), // Day after tomorrow
        "location": "456 Oak Avenue, Residential Area, Chicago, IL 60601",
        "coordinates": { "latitude": 41.8781, "longitude": -87.6298 },
        "addressData": {
          "streetAddress": "456 Oak Avenue",
          "city": "Chicago", "state": "IL", "zipCode": "60601",
          "country": "United States",
          "fullAddress": "456 Oak Avenue, Chicago, IL 60601, United States",
          "shortAddress": "Chicago, IL, 60601"
        },
        "notes": "Kitchen remodeling - cabinets and countertops installation"
      },
      {
        "ticketNumber": "TKT-2025-003",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(1), // Tomorrow
        "location": "789 Pine Street, Suburban Area, Los Angeles, CA 90210",
        "coordinates": { "latitude": 34.0522, "longitude": -118.2437 },
        "addressData": {
          "streetAddress": "789 Pine Street",
          "city": "Los Angeles", "state": "CA", "zipCode": "90210",
          "country": "United States",
          "fullAddress": "789 Pine Street, Los Angeles, CA 90210, United States",
          "shortAddress": "Los Angeles, CA, 90210"
        },
        "notes": "Bathroom renovation - tile work and fixtures installation"
      },
      {
        "ticketNumber": "TKT-2025-004",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(2), // Day after tomorrow
        "location": "321 Elm Street, Business District, Miami, FL 33101",
        "coordinates": { "latitude": 25.7617, "longitude": -80.1918 },
        "addressData": {
          "streetAddress": "321 Elm Street",
          "city": "Miami", "state": "FL", "zipCode": "33101",
          "country": "United States",
          "fullAddress": "321 Elm Street, Miami, FL 33101, United States",
          "shortAddress": "Miami, FL, 33101"
        },
        "notes": "Office building renovation - HVAC and electrical systems"
      },
      {
        "ticketNumber": "TKT-2025-005",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(1), // Tomorrow
        "location": "654 Maple Drive, Industrial Zone, Seattle, WA 98101",
        "coordinates": { "latitude": 47.6062, "longitude": -122.3321 },
        "addressData": {
          "streetAddress": "654 Maple Drive",
          "city": "Seattle", "state": "WA", "zipCode": "98101",
          "country": "United States",
          "fullAddress": "654 Maple Drive, Seattle, WA 98101, United States",
          "shortAddress": "Seattle, WA, 98101"
        },
        "notes": "Warehouse construction - foundation and structural work"
      },
      
      // 2 Expired Tickets
      {
        "ticketNumber": "TKT-2025-006",
        "organization": "My Construction Company",
        "status": "Expired",
        "expirationDate": createDate(-5), // 5 days ago
        "location": "987 Cedar Lane, Residential Area, Phoenix, AZ 85001",
        "coordinates": { "latitude": 33.4484, "longitude": -112.0740 },
        "addressData": {
          "streetAddress": "987 Cedar Lane",
          "city": "Phoenix", "state": "AZ", "zipCode": "85001",
          "country": "United States",
          "fullAddress": "987 Cedar Lane, Phoenix, AZ 85001, United States",
          "shortAddress": "Phoenix, AZ, 85001"
        },
        "notes": "Pool installation project - completed but ticket expired"
      },
      {
        "ticketNumber": "TKT-2025-007",
        "organization": "My Construction Company",
        "status": "Expired",
        "expirationDate": createDate(-3), // 3 days ago
        "location": "147 Birch Street, Commercial Area, Denver, CO 80201",
        "coordinates": { "latitude": 39.7392, "longitude": -104.9903 },
        "addressData": {
          "streetAddress": "147 Birch Street",
          "city": "Denver", "state": "CO", "zipCode": "80201",
          "country": "United States",
          "fullAddress": "147 Birch Street, Denver, CO 80201, United States",
          "shortAddress": "Denver, CO, 80201"
        },
        "notes": "Retail space renovation - delayed due to permit issues"
      },
      
      // 5 Normal Tickets (expiring in 7+ days)
      {
        "ticketNumber": "TKT-2025-008",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(14), // 2 weeks from now
        "location": "258 Spruce Avenue, Downtown, Boston, MA 02101",
        "coordinates": { "latitude": 42.3601, "longitude": -71.0589 },
        "addressData": {
          "streetAddress": "258 Spruce Avenue",
          "city": "Boston", "state": "MA", "zipCode": "02101",
          "country": "United States",
          "fullAddress": "258 Spruce Avenue, Boston, MA 02101, United States",
          "shortAddress": "Boston, MA, 02101"
        },
        "notes": "Historic building restoration - masonry and window replacement"
      },
      {
        "ticketNumber": "TKT-2025-009",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(21), // 3 weeks from now
        "location": "369 Willow Way, Suburban, Austin, TX 73301",
        "coordinates": { "latitude": 30.2672, "longitude": -97.7431 },
        "addressData": {
          "streetAddress": "369 Willow Way",
          "city": "Austin", "state": "TX", "zipCode": "73301",
          "country": "United States",
          "fullAddress": "369 Willow Way, Austin, TX 73301, United States",
          "shortAddress": "Austin, TX, 73301"
        },
        "notes": "New home construction - framing and roofing work"
      },
      {
        "ticketNumber": "TKT-2025-010",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(30), // 1 month from now
        "location": "741 Poplar Place, Industrial, Portland, OR 97201",
        "coordinates": { "latitude": 45.5152, "longitude": -122.6784 },
        "addressData": {
          "streetAddress": "741 Poplar Place",
          "city": "Portland", "state": "OR", "zipCode": "97201",
          "country": "United States",
          "fullAddress": "741 Poplar Place, Portland, OR 97201, United States",
          "shortAddress": "Portland, OR, 97201"
        },
        "notes": "Manufacturing facility expansion - concrete and steel work"
      },
      {
        "ticketNumber": "TKT-2025-011",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(45), // 6 weeks from now
        "location": "852 Ash Court, Residential, Nashville, TN 37201",
        "coordinates": { "latitude": 36.1627, "longitude": -86.7816 },
        "addressData": {
          "streetAddress": "852 Ash Court",
          "city": "Nashville", "state": "TN", "zipCode": "37201",
          "country": "United States",
          "fullAddress": "852 Ash Court, Nashville, TN 37201, United States",
          "shortAddress": "Nashville, TN, 37201"
        },
        "notes": "Multi-family housing project - foundation and utilities"
      },
      {
        "ticketNumber": "TKT-2025-012",
        "organization": "My Construction Company",
        "status": "Open",
        "expirationDate": createDate(60), // 2 months from now
        "location": "963 Hickory Hill, Commercial, Las Vegas, NV 89101",
        "coordinates": { "latitude": 36.1699, "longitude": -115.1398 },
        "addressData": {
          "streetAddress": "963 Hickory Hill",
          "city": "Las Vegas", "state": "NV", "zipCode": "89101",
          "country": "United States",
          "fullAddress": "963 Hickory Hill, Las Vegas, NV 89101, United States",
          "shortAddress": "Las Vegas, NV, 89101"
        },
        "notes": "Shopping center renovation - facade and parking lot work"
      }
    ] : [
      // 5 Near Expiry Tickets (expiring within 48 hours)
      {
        "ticketNumber": "TKT-2025-001",
        "organization": "Healthcare Systems Group",
        "status": "Open",
        "expirationDate": createDate(1), // Tomorrow
        "location": "555 Medical Center Way, Healthcare District, New York, NY 10001",
        "coordinates": { "latitude": 40.7589, "longitude": -73.9851 },
        "addressData": {
          "streetAddress": "555 Medical Center Way",
          "city": "New York", "state": "NY", "zipCode": "10001",
          "country": "United States",
          "fullAddress": "555 Medical Center Way, New York, NY 10001, United States",
          "shortAddress": "New York, NY, 10001"
        },
        "notes": "Hospital expansion - emergency power and medical gas systems installation"
      },
      {
        "ticketNumber": "TKT-2025-002",
        "organization": "City Utilities Inc.",
        "status": "Open",
        "expirationDate": createDate(2), // Day after tomorrow
        "location": "123 Main Street, Downtown District, Chicago, IL 60601",
        "coordinates": { "latitude": 41.8781, "longitude": -87.6298 },
        "addressData": {
          "streetAddress": "123 Main Street",
          "city": "Chicago", "state": "IL", "zipCode": "60601",
          "country": "United States",
          "fullAddress": "123 Main Street, Chicago, IL 60601, United States",
          "shortAddress": "Chicago, IL, 60601"
        },
        "notes": "Underground utility work - water main replacement and gas line installation"
      },
      {
        "ticketNumber": "TKT-2025-003",
        "organization": "Metro Construction LLC",
        "status": "Open",
        "expirationDate": createDate(1), // Tomorrow
        "location": "789 Industrial Blvd, Manufacturing Zone, Los Angeles, CA 90210",
        "coordinates": { "latitude": 34.0522, "longitude": -118.2437 },
        "addressData": {
          "streetAddress": "789 Industrial Blvd",
          "city": "Los Angeles", "state": "CA", "zipCode": "90210",
          "country": "United States",
          "fullAddress": "789 Industrial Blvd, Los Angeles, CA 90210, United States",
          "shortAddress": "Los Angeles, CA, 90210"
        },
        "notes": "Factory electrical upgrade - completed ahead of schedule"
      },
      {
        "ticketNumber": "TKT-2025-004",
        "organization": "State Highway Department",
        "status": "Open",
        "expirationDate": createDate(2), // Day after tomorrow
        "location": "Highway 101, Mile Marker 45, Texas",
        "coordinates": { "latitude": 31.9686, "longitude": -99.9018 },
        "addressData": {
          "streetAddress": "Highway 101",
          "city": "Austin", "state": "TX", "zipCode": "73301",
          "country": "United States",
          "fullAddress": "Highway 101, Austin, TX 73301, United States",
          "shortAddress": "Austin, TX, 73301"
        },
        "notes": "Bridge construction - structural steel and concrete work"
      },
      {
        "ticketNumber": "TKT-2025-005",
        "organization": "Green Energy Solutions",
        "status": "Open",
        "expirationDate": createDate(1), // Tomorrow
        "location": "456 Solar Farm Road, Renewable Energy Park, Phoenix, AZ 85001",
        "coordinates": { "latitude": 33.4484, "longitude": -112.0740 },
        "addressData": {
          "streetAddress": "456 Solar Farm Road",
          "city": "Phoenix", "state": "AZ", "zipCode": "85001",
          "country": "United States",
          "fullAddress": "456 Solar Farm Road, Phoenix, AZ 85001, United States",
          "shortAddress": "Phoenix, AZ, 85001"
        },
        "notes": "Solar panel installation - phase 2 of renewable energy project"
      },
      
      // 2 Expired Tickets
      {
        "ticketNumber": "TKT-2025-006",
        "organization": "Urban Development Corp",
        "status": "Expired",
        "expirationDate": createDate(-7), // 1 week ago
        "location": "321 Downtown Plaza, Business District, Miami, FL 33101",
        "coordinates": { "latitude": 25.7617, "longitude": -80.1918 },
        "addressData": {
          "streetAddress": "321 Downtown Plaza",
          "city": "Miami", "state": "FL", "zipCode": "33101",
          "country": "United States",
          "fullAddress": "321 Downtown Plaza, Miami, FL 33101, United States",
          "shortAddress": "Miami, FL, 33101"
        },
        "notes": "High-rise construction - foundation and structural work"
      },
      {
        "ticketNumber": "TKT-2025-007",
        "organization": "Water Treatment Authority",
        "status": "Expired",
        "expirationDate": createDate(-3), // 3 days ago
        "location": "987 Water Treatment Plant, Industrial Area, Seattle, WA 98101",
        "coordinates": { "latitude": 47.6062, "longitude": -122.3321 },
        "addressData": {
          "streetAddress": "987 Water Treatment Plant",
          "city": "Seattle", "state": "WA", "zipCode": "98101",
          "country": "United States",
          "fullAddress": "987 Water Treatment Plant, Seattle, WA 98101, United States",
          "shortAddress": "Seattle, WA, 98101"
        },
        "notes": "Water treatment facility upgrade - completed successfully"
      },
      
      // 5 Normal Tickets (expiring in 7+ days)
      {
        "ticketNumber": "TKT-2025-008",
        "organization": "Healthcare Systems Group",
        "status": "Open",
        "expirationDate": createDate(14), // 2 weeks from now
        "location": "555 Medical Center Way, Healthcare District, New York, NY 10001",
        "coordinates": { "latitude": 40.7589, "longitude": -73.9851 },
        "addressData": {
          "streetAddress": "555 Medical Center Way",
          "city": "New York", "state": "NY", "zipCode": "10001",
          "country": "United States",
          "fullAddress": "555 Medical Center Way, New York, NY 10001, United States",
          "shortAddress": "New York, NY, 10001"
        },
        "notes": "Hospital expansion - emergency power and medical gas systems installation"
      },
      {
        "ticketNumber": "TKT-2025-009",
        "organization": "City Utilities Inc.",
        "status": "Open",
        "expirationDate": createDate(21), // 3 weeks from now
        "location": "123 Main Street, Downtown District, Chicago, IL 60601",
        "coordinates": { "latitude": 41.8781, "longitude": -87.6298 },
        "addressData": {
          "streetAddress": "123 Main Street",
          "city": "Chicago", "state": "IL", "zipCode": "60601",
          "country": "United States",
          "fullAddress": "123 Main Street, Chicago, IL 60601, United States",
          "shortAddress": "Chicago, IL, 60601"
        },
        "notes": "Underground utility work - water main replacement and gas line installation"
      },
      {
        "ticketNumber": "TKT-2025-010",
        "organization": "Metro Construction LLC",
        "status": "Open",
        "expirationDate": createDate(30), // 1 month from now
        "location": "789 Industrial Blvd, Manufacturing Zone, Los Angeles, CA 90210",
        "coordinates": { "latitude": 34.0522, "longitude": -118.2437 },
        "addressData": {
          "streetAddress": "789 Industrial Blvd",
          "city": "Los Angeles", "state": "CA", "zipCode": "90210",
          "country": "United States",
          "fullAddress": "789 Industrial Blvd, Los Angeles, CA 90210, United States",
          "shortAddress": "Los Angeles, CA, 90210"
        },
        "notes": "Factory electrical upgrade - completed ahead of schedule"
      },
      {
        "ticketNumber": "TKT-2025-011",
        "organization": "State Highway Department",
        "status": "Open",
        "expirationDate": createDate(45), // 6 weeks from now
        "location": "Highway 101, Mile Marker 45, Texas",
        "coordinates": { "latitude": 31.9686, "longitude": -99.9018 },
        "addressData": {
          "streetAddress": "Highway 101",
          "city": "Austin", "state": "TX", "zipCode": "73301",
          "country": "United States",
          "fullAddress": "Highway 101, Austin, TX 73301, United States",
          "shortAddress": "Austin, TX, 73301"
        },
        "notes": "Bridge construction - structural steel and concrete work"
      },
      {
        "ticketNumber": "TKT-2025-012",
        "organization": "Green Energy Solutions",
        "status": "Open",
        "expirationDate": createDate(60), // 2 months from now
        "location": "456 Solar Farm Road, Renewable Energy Park, Phoenix, AZ 85001",
        "coordinates": { "latitude": 33.4484, "longitude": -112.0740 },
        "addressData": {
          "streetAddress": "456 Solar Farm Road",
          "city": "Phoenix", "state": "AZ", "zipCode": "85001",
          "country": "United States",
          "fullAddress": "456 Solar Farm Road, Phoenix, AZ 85001, United States",
          "shortAddress": "Phoenix, AZ, 85001"
        },
        "notes": "Solar panel installation - phase 2 of renewable energy project"
      }
    ];

    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isContractor ? 'sample-contractor-tickets-import.json' : 'sample-tickets-import.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setTicketsData([]);
    setDuplicates([]);
    setImportResults(null);
    setError('');
    setOverwriteExisting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <CheckCircleIcon color="success" />;
      case 'Closed': return <CheckCircleIcon color="action" />;
      case 'Expired': return <WarningIcon color="warning" />;
      default: return <ErrorIcon color="error" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'success';
      case 'Closed': return 'default';
      case 'Expired': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Import Tickets
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadSampleFile}
              sx={{ mr: 2 }}
            >
              Download Sample
            </Button>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {user?.role === 'Contractor' 
              ? 'Import multiple tickets from a JSON file. All imported tickets will be automatically assigned to you. The system will detect duplicates and allow you to choose whether to overwrite existing tickets.'
              : 'Import multiple tickets from a JSON file. The system will detect duplicates and allow you to choose whether to overwrite existing tickets.'
            }
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Select File</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    Select JSON File
                  </Button>
                  {selectedFile && (
                    <Typography variant="body2" color="text.secondary">
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Preview Data</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Found {ticketsData.length} tickets to import
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    onClick={() => setShowPreview(!showPreview)}
                    sx={{ mb: 2 }}
                  >
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>

                  {showPreview && (
                    <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Ticket Number</TableCell>
                            <TableCell>Organization</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Expiration</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ticketsData.slice(0, 10).map((ticket, index) => (
                            <TableRow key={index}>
                              <TableCell>{ticket.ticketNumber}</TableCell>
                              <TableCell>{ticket.organization}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={getStatusIcon(ticket.status)}
                                  label={ticket.status}
                                  color={getStatusColor(ticket.status)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{ticket.location}</TableCell>
                              <TableCell>
                                {new Date(ticket.expirationDate).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {ticketsData.length > 10 && (
                        <Typography variant="caption" sx={{ p: 2, display: 'block' }}>
                          Showing first 10 tickets of {ticketsData.length} total
                        </Typography>
                      )}
                    </TableContainer>
                  )}

                  <Button
                    variant="contained"
                    onClick={checkDuplicates}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    Check for Duplicates
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Handle Duplicates</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {duplicates.length > 0 ? (
                    <>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Found {duplicates.length} duplicate tickets. Choose whether to overwrite existing tickets.
                      </Alert>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={overwriteExisting}
                            onChange={(e) => setOverwriteExisting(e.target.checked)}
                          />
                        }
                        label="Overwrite existing tickets"
                        sx={{ mb: 2 }}
                      />

                      <TableContainer component={Paper} sx={{ maxHeight: 300, mb: 2 }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Ticket Number</TableCell>
                              <TableCell>Organization</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Current Assignment</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {duplicates.map((duplicate, index) => (
                              <TableRow key={index}>
                                <TableCell>{duplicate.ticket.ticketNumber}</TableCell>
                                <TableCell>{duplicate.ticket.organization}</TableCell>
                                <TableCell>
                                  <Chip
                                    icon={getStatusIcon(duplicate.ticket.status)}
                                    label={duplicate.ticket.status}
                                    color={getStatusColor(duplicate.ticket.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {duplicate.existingTicket?.assignedTo?.firstName} {duplicate.existingTicket?.assignedTo?.lastName}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      No duplicate tickets found. All tickets will be created as new.
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    onClick={handleImport}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    color="primary"
                  >
                    Import Tickets
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Import Results</StepLabel>
              <StepContent>
                {importResults && (
                  <Box>
                    <Alert 
                      severity="success" 
                      sx={{ mb: 2 }}
                      action={
                        <Button color="inherit" size="small" onClick={resetImport}>
                          Import More
                        </Button>
                      }
                    >
                      Import completed successfully!
                    </Alert>

                    <Box display="flex" gap={2} mb={3}>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={`${importResults.imported.length} Imported`}
                        color="success"
                      />
                      {importResults.duplicates.length > 0 && (
                        <Chip
                          icon={<WarningIcon />}
                          label={`${importResults.duplicates.length} Duplicates`}
                          color="warning"
                        />
                      )}
                      {importResults.errors.length > 0 && (
                        <Chip
                          icon={<ErrorIcon />}
                          label={`${importResults.errors.length} Errors`}
                          color="error"
                        />
                      )}
                    </Box>

                    {importResults.errors.length > 0 && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Import Errors:
                        </Typography>
                        {importResults.errors.map((error, index) => (
                          <Typography key={index} variant="body2">
                            {error.ticketNumber}: {error.error}
                          </Typography>
                        ))}
                      </Alert>
                    )}
                  </Box>
                )}
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImportTickets;