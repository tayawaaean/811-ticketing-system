import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
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
  TablePagination,
  Alert,
  Snackbar,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  MarkEmailUnread as MarkAsUnreadIcon,
  MarkEmailRead as MarkAsReadIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AlertManagement = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all'); // all, unread, critical, high, medium, low
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/alerts');
      let filteredAlerts = response.data.alerts || [];

      // Apply filters
      if (filter === 'unread') {
        filteredAlerts = filteredAlerts.filter(alert => !alert.isRead);
      } else if (filter !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === filter);
      }

      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      // DEV MODE: Provide mock data when API fails
      const mockAlerts = [
        {
          _id: '1',
          type: 'expiring_soon',
          message: 'Ticket TKT-2024-001 will expire in 2 hours',
          severity: 'high',
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          ticketId: { ticketNumber: 'TKT-2024-001' }
        },
        {
          _id: '2',
          type: 'expired',
          message: 'Ticket TKT-2024-004 has expired',
          severity: 'critical',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          ticketId: { ticketNumber: 'TKT-2024-004' }
        },
        {
          _id: '3',
          type: 'renewed',
          message: 'Ticket TKT-2024-002 was renewed for 15 days',
          severity: 'low',
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          ticketId: { ticketNumber: 'TKT-2024-002' }
        },
        {
          _id: '4',
          type: 'closed',
          message: 'Ticket TKT-2024-003 has been closed',
          severity: 'low',
          isRead: true,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          ticketId: { ticketNumber: 'TKT-2024-003' }
        },
        {
          _id: '5',
          type: 'expiring_soon',
          message: 'Ticket TKT-2024-002 will expire in 1 day',
          severity: 'medium',
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          ticketId: { ticketNumber: 'TKT-2024-002' }
        }
      ];

      // Apply filters to mock data
      let filteredAlerts = mockAlerts;
      if (filter === 'unread') {
        filteredAlerts = filteredAlerts.filter(alert => !alert.isRead);
      } else if (filter !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === filter);
      }

      setAlerts(filteredAlerts);
      setSnackbar({
        open: true,
        message: 'Using mock data (API unavailable)',
        severity: 'info',
      });
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await axios.put(`/alerts/${alertId}`, { isRead: true });
      setSnackbar({
        open: true,
        message: 'Alert marked as read',
        severity: 'success',
      });
      loadAlerts();
    } catch (error) {
      // DEV MODE: Update local state when API fails
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId ? { ...alert, isRead: true } : alert
        )
      );
      setSnackbar({
        open: true,
        message: 'Alert marked as read (mock)',
        severity: 'success',
      });
    }
  };

  const handleMarkAsUnread = async (alertId) => {
    try {
      await axios.put(`/alerts/${alertId}`, { isRead: false });
      setSnackbar({
        open: true,
        message: 'Alert marked as unread',
        severity: 'success',
      });
      loadAlerts();
    } catch (error) {
      // DEV MODE: Update local state when API fails
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId ? { ...alert, isRead: false } : alert
        )
      );
      setSnackbar({
        open: true,
        message: 'Alert marked as unread (mock)',
        severity: 'success',
      });
    }
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setAlertDialogOpen(true);
  };

  const handleCloseAlertDialog = () => {
    setAlertDialogOpen(false);
    setSelectedAlert(null);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      console.log('Marking all alerts as read...');
      const response = await axios.put('/alerts/mark-all-read');
      console.log('Mark all as read response:', response.data);
      
      setSnackbar({
        open: true,
        message: `All alerts marked as read (${response.data.modifiedCount || 0} alerts updated)`,
        severity: 'success',
      });
      loadAlerts();
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      
      // DEV MODE: Update local state when API fails
      const unreadCount = alerts.filter(alert => !alert.isRead).length;
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => ({ ...alert, isRead: true }))
      );
      setSnackbar({
        open: true,
        message: `All alerts marked as read (mock) - ${unreadCount} alerts updated`,
        severity: 'success',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      case 'medium': return <InfoIcon color="info" />;
      case 'low': return <CheckCircleIcon color="success" />;
      default: return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'expired': return 'error';
      case 'expiring_soon': return 'warning';
      case 'renewed': return 'success';
      case 'closed': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getAlertStats = () => {
    const total = alerts.length;
    const unread = alerts.filter(alert => !alert.isRead).length;
    const critical = alerts.filter(alert => alert.severity === 'critical').length;
    const high = alerts.filter(alert => alert.severity === 'high').length;

    return { total, unread, critical, high };
  };

  const stats = getAlertStats();

  return (
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography 
          variant="h4" 
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Alert Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAlerts}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<MarkAsReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0 || loading}
            sx={{
              backgroundColor: stats.unread === 0 ? '#e0e0e0' : '#1976d2',
              '&:hover': {
                backgroundColor: stats.unread === 0 ? '#e0e0e0' : '#1565c0',
              }
            }}
          >
            {loading ? 'Processing...' : `Mark All Read (${stats.unread})`}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Alerts
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Unread
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.unread}
                  </Typography>
                </Box>
                <Badge badgeContent={stats.unread} color="error">
                  <MarkAsUnreadIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Critical
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {stats.critical}
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    High Priority
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.high}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <Typography variant="h6" sx={{ mr: 2 }}>
            Filter:
          </Typography>
          {['all', 'unread', 'critical', 'high', 'medium', 'low'].map((filterType) => (
            <Chip
              key={filterType}
              label={filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              onClick={() => setFilter(filterType)}
              color={filter === filterType ? 'primary' : 'default'}
              variant={filter === filterType ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
        {alerts
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((alert) => {
            const severityIcon = getSeverityIcon(alert.severity);
            const severityColor = getSeverityColor(alert.severity);
            const typeColor = getTypeColor(alert.type);

            return (
              <Card
                key={alert._id}
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
                      {alert.type}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {severityIcon}
                      <Chip
                        label={alert.severity}
                        size="small"
                        sx={{
                          backgroundColor: `${severityColor === 'success' ? '#e8f5e8' :
                                           severityColor === 'warning' ? '#fff3e0' :
                                           severityColor === 'error' ? '#ffebee' : '#e3f2fd'}`,
                          color: `${severityColor === 'success' ? '#2e7d32' :
                                 severityColor === 'warning' ? '#f57c00' :
                                 severityColor === 'error' ? '#d32f2f' : '#1976d2'}`,
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </Box>

                  <Box mb={1}>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mb: 0.5 }}>
                      {alert.message}
                    </Typography>
                    {alert.ticketId && (
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mb: 0.5 }}>
                        <strong>Ticket:</strong> {alert.ticketId.ticketNumber || alert.ticketId._id || 'N/A'}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                      <strong>Created:</strong> {formatDate(alert.createdAt)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: alert.isRead ? '#e8f5e8' : '#ffebee',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: alert.isRead ? '#2e7d32' : '#d32f2f'
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                        {alert.isRead ? 'Read' : 'Unread'}
                      </Typography>
                    </Box>

                    <Box display="flex" gap={0.5}>
                      <Tooltip title={alert.isRead ? 'Mark as Unread' : 'Mark as Read'}>
                        <IconButton
                          onClick={() => 
                            alert.isRead 
                              ? handleMarkAsUnread(alert._id)
                              : handleMarkAsRead(alert._id)
                          }
                          size="small"
                          sx={{
                            color: alert.isRead ? '#666666' : '#2e7d32',
                            '&:hover': {
                              backgroundColor: alert.isRead ? '#f5f5f5' : '#e8f5e8'
                            }
                          }}
                        >
                          {alert.isRead ? <Badge sx={{ fontSize: 16 }} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => handleViewDetails(alert)}
                          size="small"
                          sx={{
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#e3f2fd'
                            }
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
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
          display: { xs: 'none', md: 'block' },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
          overflow: 'hidden'
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
            minWidth: { xs: 'auto', md: 650 },
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
                  Type
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
                  Severity
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1a1a1a',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #e3f2fd',
                    width: '30%'
                  }}
                >
                  Message
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
                  Ticket
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
                  Created
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
                  Status
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
                    width: '10%'
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((alert) => (
                  <TableRow 
                    key={alert._id} 
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
                      <Chip
                        label={alert.type.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getTypeColor(alert.type) === 'error' ? '#ffebee' : 
                                           getTypeColor(alert.type) === 'warning' ? '#fff3e0' : 
                                           getTypeColor(alert.type) === 'success' ? '#e8f5e8' : '#e3f2fd'}`,
                          color: `${getTypeColor(alert.type) === 'error' ? '#d32f2f' : 
                                  getTypeColor(alert.type) === 'warning' ? '#f57c00' : 
                                  getTypeColor(alert.type) === 'success' ? '#2e7d32' : '#1976d2'}`,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: `1px solid ${getTypeColor(alert.type) === 'error' ? '#ffcdd2' : 
                                    getTypeColor(alert.type) === 'warning' ? '#ffcc02' : 
                                    getTypeColor(alert.type) === 'success' ? '#c8e6c9' : '#bbdefb'}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: `${getSeverityColor(alert.severity) === 'error' ? '#ffebee' : 
                                             getSeverityColor(alert.severity) === 'warning' ? '#fff3e0' : 
                                             getSeverityColor(alert.severity) === 'info' ? '#e3f2fd' : '#e8f5e8'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getSeverityIcon(alert.severity)}
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#1a1a1a',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            textTransform: 'capitalize'
                          }}
                        >
                          {alert.severity}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1a1a1a',
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        {alert.message}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        {alert.ticketId?.ticketNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666666',
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        {formatDate(alert.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={alert.isRead ? 'Read' : 'Unread'}
                        size="small"
                        sx={{
                          backgroundColor: `${alert.isRead ? '#e3f2fd' : '#ffebee'}`,
                          color: `${alert.isRead ? '#1976d2' : '#d32f2f'}`,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: `1px solid ${alert.isRead ? '#bbdefb' : '#ffcdd2'}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Box display="flex" gap={0.5} justifyContent="flex-end">
                        <Tooltip title={alert.isRead ? 'Mark as Unread' : 'Mark as Read'}>
                          <IconButton
                            onClick={() => 
                              alert.isRead 
                                ? handleMarkAsUnread(alert._id)
                                : handleMarkAsRead(alert._id)
                            }
                            size="small"
                            sx={{
                              color: alert.isRead ? '#f57c00' : '#2e7d32',
                              '&:hover': {
                                backgroundColor: alert.isRead ? '#fff3e0' : '#e8f5e8',
                                color: alert.isRead ? '#ef6c00' : '#1b5e20'
                              }
                            }}
                          >
                            {alert.isRead ? <MarkAsUnreadIcon fontSize="small" /> : <MarkAsReadIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={alerts.length}
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

      {/* Alert Details Dialog */}
      <Dialog
        open={alertDialogOpen}
        onClose={handleCloseAlertDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Alert Details
          </Typography>
          <IconButton onClick={handleCloseAlertDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedAlert && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Chip
                  label={selectedAlert.type.replace('_', ' ').toUpperCase()}
                  sx={{
                    backgroundColor: `${getTypeColor(selectedAlert.type) === 'error' ? '#ffebee' :
                                     getTypeColor(selectedAlert.type) === 'warning' ? '#fff3e0' :
                                     getTypeColor(selectedAlert.type) === 'success' ? '#e8f5e8' : '#e3f2fd'}`,
                    color: `${getTypeColor(selectedAlert.type) === 'error' ? '#d32f2f' :
                            getTypeColor(selectedAlert.type) === 'warning' ? '#f57c00' :
                            getTypeColor(selectedAlert.type) === 'success' ? '#2e7d32' : '#1976d2'}`,
                    fontWeight: 600
                  }}
                />
                <Chip
                  label={selectedAlert.severity.toUpperCase()}
                  sx={{
                    backgroundColor: `${getSeverityColor(selectedAlert.severity) === 'error' ? '#ffebee' :
                                     getSeverityColor(selectedAlert.severity) === 'warning' ? '#fff3e0' :
                                     getSeverityColor(selectedAlert.severity) === 'info' ? '#e3f2fd' : '#e8f5e8'}`,
                    color: `${getSeverityColor(selectedAlert.severity) === 'error' ? '#d32f2f' :
                            getSeverityColor(selectedAlert.severity) === 'warning' ? '#f57c00' :
                            getSeverityColor(selectedAlert.severity) === 'info' ? '#1976d2' : '#2e7d32'}`,
                    fontWeight: 600
                  }}
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Message
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
                {selectedAlert.message}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                    Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedAlert.type.replace('_', ' ')}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                    Severity
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedAlert.severity}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedAlert.isRead ? 'Read' : 'Unread'}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                    Created
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedAlert.createdAt)}
                  </Typography>
                </Grid>

                {selectedAlert.ticketId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                      Related Ticket
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 500 }}>
                      {selectedAlert.ticketId?.ticketNumber || selectedAlert.ticketId?._id || 'N/A'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseAlertDialog} variant="outlined">
            Close
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
      </Box>
    </Box>
  );
};

export default AlertManagement;
