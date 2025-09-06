import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Badge,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  Divider,
  Chip,
  Popover,
  MenuList,
  MenuItem,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TicketIcon,
  Warning as AlertIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Engineering as ContractorIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import TicketManagement from '../components/TicketManagement';
import AlertManagement from '../components/AlertManagement';
import ContractorProfile from '../components/ContractorProfile';
import DashboardOverview from '../components/DashboardOverview';
import ImportTickets from '../components/ImportTickets';

const drawerWidth = 240;

const ContractorDashboard = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(() => {
    // Get the saved tab from localStorage, default to 'overview'
    return localStorage.getItem('contractorSelectedTab') || 'overview';
  });
  const [stats, setStats] = useState({
    myTickets: 0,
    openTickets: 0,
    expiringSoon: 0,
    unreadAlerts: 0,
  });

  // Notification dropdown state
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const menuItems = [
    { id: 'overview', label: 'My Overview', icon: <DashboardIcon /> },
    { id: 'tickets', label: 'My Tickets', icon: <TicketIcon /> },
    { id: 'import', label: 'Import Tickets', icon: <ImportIcon /> },
    { id: 'profile', label: 'My Profile', icon: <ProfileIcon /> },
    { id: 'alerts', label: 'My Alerts', icon: <AlertIcon /> },
  ];

  useEffect(() => {
    loadStats();
    
    // Refresh stats every 30 seconds to keep notification count updated
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle URL hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash && menuItems.some(item => item.id === hash)) {
        setSelectedTab(hash);
        localStorage.setItem('contractorSelectedTab', hash);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Refresh stats when window regains focus to ensure notification count is current
  useEffect(() => {
    const handleFocus = () => {
      loadStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadStats = async () => {
    try {
      // Get real ticket stats for contractor
      const ticketsResponse = await axios.get('/tickets/stats/overview');
      const ticketsStats = ticketsResponse.data?.stats || {};

      // Get real alerts stats from backend
      const alertsResponse = await axios.get('/alerts/stats');
      const alertsStats = alertsResponse.data?.stats || {};

      setStats({
        myTickets: ticketsStats.total || 0,
        openTickets: ticketsStats.open || 0,
        expiringSoon: ticketsStats.expiringSoon || 0,
        unreadAlerts: alertsStats.unread || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to empty stats if API fails
      setStats({
        myTickets: 0,
        openTickets: 0,
        expiringSoon: 0,
        unreadAlerts: 0,
      });
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    // Clear the saved tab when logging out
    localStorage.removeItem('contractorSelectedTab');
    logout();
  };

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    localStorage.setItem('contractorSelectedTab', tabId);
    // Update URL hash for better navigation
    window.location.hash = tabId;
    handleDrawerClose();
  };

  // Notification handlers
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    loadUnreadAlerts();
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const loadUnreadAlerts = async () => {
    setLoadingNotifications(true);
    try {
      const response = await axios.get('/alerts?limit=3');
      const unreadAlertsData = response.data.alerts.filter(alert => !alert.isRead) || [];
      setUnreadAlerts(unreadAlertsData.slice(0, 3)); // Limit to 3 unread alerts
    } catch (error) {
      console.error('Error loading unread alerts:', error);
      setUnreadAlerts([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAlertAsRead = async (alertId) => {
    setMarkingAsRead(prev => ({ ...prev, [alertId]: true }));
    try {
      await axios.put(`/alerts/${alertId}`, { isRead: true });
      // Refresh alerts and stats to update the badge count
      loadUnreadAlerts();
      await loadStats();
      setSnackbar({
        open: true,
        message: 'Alert marked as read successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark alert as read. Please try again.',
        severity: 'error',
      });
    } finally {
      setMarkingAsRead(prev => ({ ...prev, [alertId]: false }));
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <CancelIcon color="error" />;
      case 'high':
        return <AlertIcon color="warning" />;
      case 'medium':
        return <ScheduleIcon color="info" />;
      case 'low':
        return <CheckCircleIcon color="success" />;
      default:
        return <AlertIcon />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const alertDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - alertDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <DashboardOverview isContractor={true} />;
      case 'tickets':
        return <TicketManagement isAdmin={false} />;
      case 'import':
        return <ImportTickets />;
      case 'profile':
        return <ContractorProfile />;
      case 'alerts':
        return <AlertManagement />;
      default:
        return <DashboardOverview isContractor={true} />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
            <ContractorIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" noWrap>
              Nova Underground
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Work Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedTab === item.id}
                onClick={() => handleTabChange(item.id)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: selectedTab === item.id ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User Info Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {user?.firstName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="medium" noWrap>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        
        {/* Logout Button */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#d32f2f',
            color: '#d32f2f',
            '&:hover': {
              backgroundColor: '#ffebee',
              borderColor: '#d32f2f',
            }
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          color: '#1a1a1a',
          borderBottom: '1px solid #e8f5e8',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 50%, #2e7d32 100%)',
          }
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: '#2e7d32',
              backgroundColor: '#f1f8e9',
              '&:hover': {
                backgroundColor: '#e8f5e8',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  color: '#1a1a1a',
                  letterSpacing: '-0.02em'
                }}
              >
                {menuItems.find(item => item.id === selectedTab)?.label || 'Dashboard'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#666666',
                  fontSize: '0.75rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {selectedTab === 'overview' && 'Your ticket overview and analytics'}
                {selectedTab === 'tickets' && 'Manage your assigned tickets'}
                {selectedTab === 'alerts' && 'Your alerts and notifications'}
                {selectedTab === 'profile' && 'Manage your profile settings'}
              </Typography>
            </Box>
            
            {/* Mobile breadcrumb */}
            {isMobile && (
              <Chip 
                label="Contractor" 
                size="small" 
                sx={{ 
                  backgroundColor: '#e8f5e8',
                  color: '#2e7d32',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #c8e6c9'
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{
                color: '#2e7d32',
                backgroundColor: '#f1f8e9',
                '&:hover': {
                  backgroundColor: '#e8f5e8',
                }
              }}
            >
              <Badge 
                badgeContent={stats.unreadAlerts > 0 ? stats.unreadAlerts : null}
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#f57c00',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                  }
                }}
              >
                <NotificationIcon />
              </Badge>
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>

      {/* Notification Dropdown */}
      <Popover
        open={Boolean(notificationAnchorEl)}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: { xs: 320, sm: 350 },
            maxHeight: { xs: 350, sm: 400 },
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #e0e0e0',
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight="bold">
            My Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.unreadAlerts} unread alerts
          </Typography>
        </Box>

        <MenuList sx={{ py: 0 }}>
          {loadingNotifications ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          ) : unreadAlerts.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No unread notifications
              </Typography>
            </Box>
          ) : (
            unreadAlerts.map((alert, index) => (
              <React.Fragment key={alert._id}>
                <MenuItem
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    px: { xs: 1.5, sm: 2 },
                    alignItems: 'flex-start',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {getSeverityIcon(alert.severity)}
                  </ListItemIcon>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {alert.ticketId?.ticketNumber || 'System Alert'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        mb: 0.5
                      }}
                    >
                      {alert.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {formatTimeAgo(alert.createdAt)}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => handleMarkAlertAsRead(alert._id)}
                    disabled={markingAsRead[alert._id]}
                    startIcon={markingAsRead[alert._id] ? <CheckCircleIcon sx={{ fontSize: '0.75rem' }} /> : null}
                    sx={{
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5,
                      fontSize: '0.75rem',
                      ml: 1,
                      borderRadius: 1.5,
                      fontWeight: 500,
                      textTransform: 'none',
                      backgroundColor: markingAsRead[alert._id] ? '#e8f5e8' : '#f3f8ff',
                      color: markingAsRead[alert._id] ? '#2e7d32' : '#1976d2',
                      border: `1px solid ${markingAsRead[alert._id] ? '#c8e6c9' : '#e3f2fd'}`,
                      '&:hover': {
                        backgroundColor: markingAsRead[alert._id] ? '#e8f5e8' : '#e3f2fd',
                        color: markingAsRead[alert._id] ? '#2e7d32' : '#1565c0',
                        borderColor: markingAsRead[alert._id] ? '#c8e6c9' : '#bbdefb',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                      '&:disabled': {
                        backgroundColor: '#f5f5f5',
                        color: '#9e9e9e',
                        borderColor: '#e0e0e0',
                        cursor: 'not-allowed',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {markingAsRead[alert._id] ? 'Marking...' : 'Mark Read'}
                  </Button>
                </MenuItem>
                {index < unreadAlerts.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </MenuList>

        {unreadAlerts.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                onClick={() => {
                  setSelectedTab('alerts');
                  handleNotificationClose();
                }}
                sx={{
                  fontSize: '0.875rem',
                  textTransform: 'none'
                }}
              >
                View All Alerts
              </Button>
            </Box>
          </>
        )}
      </Popover>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={() => setMobileOpen(true)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
            },
          }}
        >
          {drawer}
        </SwipeableDrawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 8 },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: '1200px', md: '1400px' },
            px: { xs: 0, sm: 2 },
          }}
        >
          {renderContent()}
        </Box>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContractorDashboard;
