import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  Fab,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import useUsers from '../hooks/useUsers';
import LocationPicker from './LocationPicker';
import { getLocationDisplayString } from '../utils/geocoding';
import axios from 'axios';

const TicketManagement = ({ isAdmin }) => {
  const { user } = useAuth();
  const { users } = useUsers(user?.role);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, ticket: null });

  const [formData, setFormData] = useState({
    ticketNumber: '',
    organization: '',
    status: 'Open',
    location: '',
    coordinates: {
      latitude: null,
      longitude: null,
    },
    addressData: null,
    notes: '',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    assignedTo: '',
  });

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  // Generate ticket number template
  const generateTicketNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT-${year}${month}${day}-${random}`;
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/tickets');
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load tickets. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    setEditingTicket(null);
    setFormData({
      ticketNumber: generateTicketNumber(),
      organization: user?.organization || '', // Use contractor's organization
      status: 'Open',
      location: '',
      coordinates: {
        latitude: null,
        longitude: null,
      },
      addressData: null,
      notes: '',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedTo: isAdmin ? '' : user._id,
    });
    setOpenDialog(true);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      ticketNumber: ticket.ticketNumber,
      organization: ticket.organization,
      status: ticket.status,
      location: ticket.location,
      coordinates: ticket.coordinates || { latitude: null, longitude: null },
      addressData: ticket.addressData || null,
      notes: ticket.notes,
      expirationDate: new Date(ticket.expirationDate),
      assignedTo: ticket.assignedTo._id || ticket.assignedTo,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTicket(null);
    setFormData({
      ticketNumber: '',
      organization: '',
      status: 'Open',
      location: '',
      coordinates: {
        latitude: null,
        longitude: null,
      },
      addressData: null,
      notes: '',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedTo: '',
    });
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng,
      },
      location: location.address ? location.address.shortAddress : `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      addressData: location.address // Store the full address data
    }));
    setLocationPickerOpen(false);
  };

  const handleOpenLocationPicker = () => {
    setLocationPickerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const ticketData = {
        ...formData,
        expirationDate: formData.expirationDate.toISOString(),
      };

      if (editingTicket) {
        await axios.put(`/tickets/${editingTicket._id}`, ticketData);
        setSnackbar({
          open: true,
          message: 'Ticket updated successfully',
          severity: 'success',
        });
      } else {
        await axios.post('/tickets', ticketData);
        setSnackbar({
          open: true,
          message: 'Ticket created successfully',
          severity: 'success',
        });
      }

      handleCloseDialog();
      loadTickets();
    } catch (error) {
      console.error('Error saving ticket:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save ticket. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleRenewTicket = async (ticketId) => {
    try {
      await axios.put(`/tickets/${ticketId}/renew`);
      setSnackbar({
        open: true,
        message: 'Ticket renewed successfully',
        severity: 'success',
      });
      loadTickets();
    } catch (error) {
      console.error('Error renewing ticket:', error);
      setSnackbar({
        open: true,
        message: 'Failed to renew ticket. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await axios.put(`/tickets/${ticketId}`, { status: 'Closed' });
      setSnackbar({
        open: true,
        message: 'Ticket closed successfully',
        severity: 'success',
      });
      loadTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      setSnackbar({
        open: true,
        message: 'Failed to close ticket. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await axios.delete(`/tickets/${ticketId}`);
      setSnackbar({
        open: true,
        message: 'Ticket deleted successfully',
        severity: 'success',
      });
      loadTickets();
      setDeleteDialog({ open: false, ticket: null });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete ticket. Please try again.',
        severity: 'error',
      });
    }
  };

  const openDeleteDialog = (ticket) => {
    setDeleteDialog({ open: true, ticket });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, ticket: null });
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'success';
      case 'Closed': return 'default';
      case 'Expired': return 'error';
      default: return 'default';
    }
  };

  const getExpirationStatus = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffHours = (expDate - now) / (1000 * 60 * 60);

    if (diffHours < 0) return { status: 'expired', color: 'error', icon: <WarningIcon /> };
    if (diffHours < 48) return { status: 'expiring', color: 'warning', icon: <AccessTimeIcon /> };
    return { status: 'good', color: 'success', icon: <CheckCircleIcon /> };
  };

  const filteredTickets = isAdmin 
    ? tickets 
    : tickets.filter(ticket => ticket.assignedTo._id === user._id || ticket.assignedTo === user._id);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '1200px', md: '1400px' },
          px: { xs: 0, sm: 2 },
        }}>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.75rem', sm: '2rem' },
                letterSpacing: '-0.02em'
              }}
            >
            {isAdmin ? 'All Tickets' : 'My Tickets'}
          </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666666',
                fontSize: '0.9rem',
                mt: 0.5
              }}
            >
              {isAdmin ? 'Manage all tickets and assignments' : 'View and manage your assigned tickets'}
            </Typography>
          </Box>
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadTickets}
              sx={{ 
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                borderColor: '#e3f2fd',
                color: '#1976d2',
                backgroundColor: '#f3f8ff',
                '&:hover': {
                  borderColor: '#bbdefb',
                  backgroundColor: '#e3f2fd',
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTicket}
              sx={{ 
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                }
              }}
            >
              {isAdmin ? 'Create Ticket' : 'Create Ticket'}
            </Button>
          </Box>
        </Box>

        {/* Overview Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        color: '#1976d2',
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        mb: 0.5
                      }}
                    >
                      {filteredTickets.length}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666666',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Total Tickets
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#e3f2fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                    }}
                  >
                    <AssignmentIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold" 
                      sx={{ 
                        color: '#2e7d32',
                        fontSize: '2rem',
                        mb: 0.5
                      }}
                    >
                      {filteredTickets.filter(ticket => ticket.status === 'Open').length}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666666',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Open Tickets
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#e8f5e8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)'
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold" 
                      sx={{ 
                        color: '#1976d2',
                        fontSize: '2rem',
                        mb: 0.5
                      }}
                    >
                      {filteredTickets.filter(ticket => ticket.status === 'Closed').length}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666666',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Closed Tickets
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#e3f2fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                    }}
                  >
                    <CloseIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold" 
                      sx={{ 
                        color: '#d32f2f',
                        fontSize: '2rem',
                        mb: 0.5
                      }}
                    >
                      {filteredTickets.filter(ticket => ticket.status === 'Expired').length}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666666',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Expired Tickets
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#ffebee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
                    }}
                  >
                    <WarningIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Mobile Card View */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          {filteredTickets
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((ticket) => {
              const expStatus = getExpirationStatus(ticket.expirationDate);
              return (
                <Card
                  key={ticket._id}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" fontWeight="600" sx={{ color: '#1976d2', fontSize: '1rem' }}>
                        {ticket.ticketNumber}
                      </Typography>
                      <Chip
                        label={ticket.status}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(ticket.status) === 'success' ? '#e8f5e8' :
                                           getStatusColor(ticket.status) === 'error' ? '#ffebee' : '#e3f2fd'}`,
                          color: `${getStatusColor(ticket.status) === 'success' ? '#2e7d32' :
                                  getStatusColor(ticket.status) === 'error' ? '#d32f2f' : '#1976d2'}`,
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>

                    <Box mb={1}>
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mb: 0.5 }}>
                        <strong>Organization:</strong> {ticket.organization}
                      </Typography>
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mb: 0.25 }}>
                          <strong>Location:</strong> {getLocationDisplayString(ticket)}
                        </Typography>
                        {ticket.coordinates?.latitude && ticket.coordinates?.longitude && (
                          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                            <strong>Coordinates:</strong> {ticket.coordinates.latitude.toFixed(6)}, {ticket.coordinates.longitude.toFixed(6)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: `${expStatus.color === 'success' ? '#e8f5e8' :
                                             expStatus.color === 'warning' ? '#fff3e0' : '#ffebee'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {expStatus.icon}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {new Date(ticket.expirationDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Edit Ticket">
                          <IconButton
                            onClick={() => handleEditTicket(ticket)}
                            size="small"
                            sx={{
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#e3f2fd',
                                color: '#1565c0'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {ticket.status === 'Open' && (
                          <Tooltip title="Renew Ticket (+15 days)">
                            <IconButton
                              onClick={() => handleRenewTicket(ticket._id)}
                              size="small"
                              sx={{
                                color: '#2e7d32',
                                '&:hover': {
                                  backgroundColor: '#e8f5e8',
                                  color: '#1b5e20'
                                }
                              }}
                            >
                              <ScheduleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {ticket.status === 'Open' && (
                          <Tooltip title="Close Ticket">
                            <IconButton
                              onClick={() => handleCloseTicket(ticket._id)}
                              size="small"
                              sx={{
                                color: '#f57c00',
                                '&:hover': {
                                  backgroundColor: '#fff3e0',
                                  color: '#ef6c00'
                                }
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {user?.role === 'Admin' && (
                          <Tooltip title="Delete Ticket">
                            <IconButton
                              onClick={() => openDeleteDialog(ticket)}
                              size="small"
                              sx={{
                                color: '#d32f2f',
                                '&:hover': {
                                  backgroundColor: '#ffebee',
                                  color: '#c62828'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Box mt={1} pt={1} borderTop="1px solid #e0e0e0">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: '#1976d2',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        >
                          {ticket.assignedTo?.firstName?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {ticket.assignedTo?.firstName} {ticket.assignedTo?.lastName} • {ticket.assignedTo?.email || 'Unassigned'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
        </Box>

        {/* Desktop Table View */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
            display: { xs: 'none', md: 'block' }
          }}
        >
          <TableContainer sx={{
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#a8a8a8',
              },
            },
          }}>
            <Table sx={{
              minWidth: 750,
              width: '100%',
              tableLayout: 'fixed'
            }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #e3f2fd',
                      width: '12%'
                    }}
                  >
                    Ticket Number
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #e3f2fd',
                      width: '12%'
                    }}
                  >
                    Organization
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #e3f2fd',
                      width: '8%'
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #e3f2fd',
                      width: '15%'
                    }}
                  >
                    Location
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #e3f2fd',
                      width: '12%'
                    }}
                  >
                    Coordinates
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #e3f2fd',
                      width: '10%'
                    }}
                  >
                    Expiration
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #e3f2fd',
                      width: '18%'
                    }}
                  >
                    Assigned To
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #e3f2fd',
                      width: '20%'
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ticket) => {
                    const expStatus = getExpirationStatus(ticket.expirationDate);
                    return (
                      <TableRow 
                        key={ticket._id} 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            transform: 'scale(1.01)',
                          },
                          transition: 'all 0.2s ease-in-out',
                          '&:last-child td': { border: 0 }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight="600" 
                            sx={{ 
                              color: '#1976d2',
                              fontSize: '0.9rem'
                            }}
                          >
                            {ticket.ticketNumber}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#1a1a1a',
                              fontWeight: 500
                            }}
                          >
                            {ticket.organization}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={ticket.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(ticket.status) === 'success' ? '#e8f5e8' : 
                                               getStatusColor(ticket.status) === 'error' ? '#ffebee' : '#e3f2fd'}`,
                              color: `${getStatusColor(ticket.status) === 'success' ? '#2e7d32' : 
                                      getStatusColor(ticket.status) === 'error' ? '#d32f2f' : '#1976d2'}`,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              border: `1px solid ${getStatusColor(ticket.status) === 'success' ? '#c8e6c9' : 
                                        getStatusColor(ticket.status) === 'error' ? '#ffcdd2' : '#bbdefb'}`,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#666666',
                              fontWeight: 500
                            }}
                          >
                            {getLocationDisplayString(ticket)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {ticket.coordinates?.latitude && ticket.coordinates?.longitude ? (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#666666',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}
                            >
                              {ticket.coordinates.latitude.toFixed(6)}, {ticket.coordinates.longitude.toFixed(6)}
                            </Typography>
                          ) : (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#999999',
                                fontStyle: 'italic'
                              }}
                            >
                              No coordinates
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: `${expStatus.color === 'success' ? '#e8f5e8' : 
                                                 expStatus.color === 'warning' ? '#fff3e0' : '#ffebee'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                            {expStatus.icon}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: `${expStatus.color === 'success' ? '#2e7d32' : 
                                        expStatus.color === 'warning' ? '#f57c00' : '#d32f2f'}`,
                                fontWeight: 500,
                                fontSize: '0.875rem'
                              }}
                            >
                              {new Date(ticket.expirationDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32, 
                                bgcolor: '#1976d2',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                fontSize: '0.875rem'
                              }}
                            >
                              {ticket.assignedTo?.firstName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#1a1a1a',
                                  fontWeight: 600,
                                  fontSize: '0.875rem'
                                }}
                              >
                          {ticket.assignedTo?.firstName} {ticket.assignedTo?.lastName}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#666666',
                                  fontSize: '0.75rem'
                                }}
                              >
                                {ticket.assignedTo?.email || 'Unassigned'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2 }}>
                          <Box display="flex" gap={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit Ticket">
                              <IconButton
                                onClick={() => handleEditTicket(ticket)}
                                size="small"
                                sx={{
                                  color: '#1976d2',
                                  '&:hover': {
                                    backgroundColor: '#e3f2fd',
                                    color: '#1565c0'
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {ticket.status === 'Open' && (
                              <Tooltip title="Renew Ticket (+15 days)">
                                <IconButton
                                  onClick={() => handleRenewTicket(ticket._id)}
                                  size="small"
                                  sx={{
                                    color: '#2e7d32',
                                    '&:hover': {
                                      backgroundColor: '#e8f5e8',
                                      color: '#1b5e20'
                                    }
                                  }}
                                >
                                  <ScheduleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {ticket.status === 'Open' && (
                              <Tooltip title="Close Ticket">
                                <IconButton
                                  onClick={() => handleCloseTicket(ticket._id)}
                                  size="small"
                                  sx={{
                                    color: '#f57c00',
                                    '&:hover': {
                                      backgroundColor: '#fff3e0',
                                      color: '#ef6c00'
                                    }
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {user?.role === 'Admin' && (
                              <Tooltip title="Delete Ticket">
                                <IconButton
                                  onClick={() => openDeleteDialog(ticket)}
                                  size="small"
                                  sx={{
                                    color: '#d32f2f',
                                    '&:hover': {
                                      backgroundColor: '#ffebee',
                                      color: '#c62828'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTickets.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderTop: '1px solid #f0f0f0',
              backgroundColor: '#fafafa',
              '& .MuiTablePagination-toolbar': {
                paddingLeft: 3,
                paddingRight: 3,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: '#666666',
                fontWeight: 500,
                fontSize: '0.875rem'
              },
              '& .MuiTablePagination-select': {
                color: '#1a1a1a',
                fontWeight: 600
              },
              '& .MuiIconButton-root': {
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: '#e3f2fd'
                },
                '&.Mui-disabled': {
                  color: '#cccccc'
                }
              }
            }}
          />
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              maxHeight: '95vh',
              backgroundColor: '#FFFFFF',
            }
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              px: 1.5,
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 0.5, color: '#1F2937' }}>
                {editingTicket ? 'Edit Ticket' : 'Create New Ticket'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.9rem' }}>
                {editingTicket ? 'Update ticket information' : 'Add a new ticket to the system'}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseDialog}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 1.5, backgroundColor: '#FFFFFF' }}>
            {/* Layer 1: Ticket Number, Organization, Status */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1.5,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ mb: 0.5, color: '#1F2937' }}
              >
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Ticket Number"
                    value={formData.ticketNumber}
                    onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                    required
                    placeholder="Ticket Number"
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setFormData({ ...formData, ticketNumber: generateTicketNumber() })}
                          edge="end"
                          sx={{
                            color: '#6B7280',
                            '&:hover': {
                              backgroundColor: '#F3F4F6',
                            },
                          }}
                          title="Generate new ticket number"
                        >
                          <RefreshIcon />
                        </IconButton>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        backgroundColor: '#FFFFFF',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D5DB',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2563EB',
                          borderWidth: 1,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2563EB',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: '#9CA3AF',
                        opacity: 1,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    required
                    placeholder="Organization"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        backgroundColor: '#FFFFFF',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D5DB',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2563EB',
                          borderWidth: 1,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2563EB',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: '#9CA3AF',
                        opacity: 1,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      label="Status"
                      sx={{
                        borderRadius: 1.5,
                        backgroundColor: '#FFFFFF',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D5DB',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2563EB',
                          borderWidth: 1,
                        },
                      }}
                    >
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                      <MenuItem value="Expired">Expired</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Layer 2: Expiration Date, Location */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1.5,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ mb: 0.5, color: '#1F2937' }}
              >
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label="Expiration Date"
                    value={formData.expirationDate}
                    onChange={(newValue) => setFormData({ ...formData, expirationDate: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="Select Date"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            backgroundColor: '#FFFFFF',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#D1D5DB',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#2563EB',
                              borderWidth: 1,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#2563EB',
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: '#9CA3AF',
                            opacity: 1,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder="Location or coordinates"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          backgroundColor: '#FFFFFF',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#D1D5DB',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2563EB',
                            borderWidth: 1,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#2563EB',
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9CA3AF',
                          opacity: 1,
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleOpenLocationPicker}
                      startIcon={<LocationOnIcon />}
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        borderRadius: 1.5,
                        borderColor: '#2563EB',
                        color: '#2563EB',
                        '&:hover': {
                          borderColor: '#1D4ED8',
                          backgroundColor: '#EFF6FF',
                        },
                      }}
                    >
                      Map
                    </Button>
                  </Box>
                  {formData.coordinates.latitude && formData.coordinates.longitude && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Coordinates: {formData.coordinates.latitude.toFixed(6)}, {formData.coordinates.longitude.toFixed(6)}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Layer 2.5: Contractor Assignment */}
            {isAdmin && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{ mb: 0.5, color: '#1F2937' }}
                >
                  Assignment
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Assign to Contractor</InputLabel>
                  <Select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    label="Assign to Contractor"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 200,
                          overflowY: 'auto',
                        },
                      },
                    }}
                    sx={{
                      borderRadius: 1.5,
                      backgroundColor: '#FFFFFF',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D5DB',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563EB',
                        borderWidth: 1,
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Unassigned</em>
                    </MenuItem>
                    {users
                      .filter(user => user.role === 'Contractor' && user.isActive)
                      .map((contractor) => (
                        <MenuItem key={contractor._id} value={contractor._id}>
                          {contractor.firstName} {contractor.lastName} ({contractor.email})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Paper>
            )}

            {/* Layer 3: Notes */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ mb: 0.5, color: '#1F2937' }}
              >
                Additional Notes
              </Typography>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={2}
                placeholder="Additional Notes"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    backgroundColor: '#FFFFFF',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563EB',
                      borderWidth: 1,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#2563EB',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#9CA3AF',
                    opacity: 1,
                  },
                }}
              />
            </Paper>
          </DialogContent>
          <DialogActions sx={{
            p: 1.5,
            gap: 1.5,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #F3F4F6',
            justifyContent: 'flex-end',
          }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                borderColor: '#D1D5DB',
                color: '#1F2937',
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  backgroundColor: '#F3F4F6',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                borderRadius: 1.5,
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                backgroundColor: '#2563EB',
                '&:hover': {
                  backgroundColor: '#1D4ED8',
                },
              }}
            >
              {editingTicket ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Location Picker Modal */}
        <LocationPicker
          open={locationPickerOpen}
          onClose={() => setLocationPickerOpen(false)}
          onLocationSelect={handleLocationSelect}
          initialLocation={formData.coordinates.latitude && formData.coordinates.longitude ? 
            { 
              lat: formData.coordinates.latitude, 
              lng: formData.coordinates.longitude,
              address: formData.addressData
            } : null
          }
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={closeDeleteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: '#FEF2F2', 
            color: '#DC2626',
            fontWeight: 600,
            borderBottom: '1px solid #FECACA'
          }}>
            Delete Ticket
          </DialogTitle>
          <DialogContent sx={{ p: 3, backgroundColor: '#FFFFFF' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </Typography>
            {deleteDialog.ticket && (
              <Box sx={{ 
                backgroundColor: '#F9FAFB', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid #E5E7EB'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Ticket Details:
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Ticket Number:</strong> {deleteDialog.ticket.ticketNumber}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Organization:</strong> {deleteDialog.ticket.organization}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Status:</strong> {deleteDialog.ticket.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {deleteDialog.ticket.location}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{
            p: 2,
            gap: 1,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #F3F4F6',
            justifyContent: 'flex-end',
          }}>
            <Button
              onClick={closeDeleteDialog}
              variant="outlined"
              sx={{
                borderRadius: 1,
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                borderColor: '#D1D5DB',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDeleteTicket(deleteDialog.ticket?._id)}
              variant="contained"
              sx={{
                borderRadius: 1,
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                backgroundColor: '#DC2626',
                '&:hover': {
                  backgroundColor: '#B91C1C',
                },
              }}
            >
              Delete Ticket
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketManagement;
