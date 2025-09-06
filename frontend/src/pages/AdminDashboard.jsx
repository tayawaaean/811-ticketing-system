import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Chip,
  Card,
  CardContent,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  Popover,
  MenuList,
  MenuItem as MuiMenuItem,
  Divider as MuiDivider,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TicketIcon,
  Warning as AlertIcon,
  FileUpload as ImportIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Notifications as NotificationIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import TicketManagement from '../components/TicketManagement';
import AlertManagement from '../components/AlertManagement';
import ImportTickets from '../components/ImportTickets';
import Contractors from '../components/UserManagement';
import DashboardOverview from '../components/DashboardOverview';

const drawerWidth = 280;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(() => {
    // Get tab from URL params or default to 'overview'
    return searchParams.get('tab') || 'overview';
  });
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    expiredTickets: 0,
    closedTickets: 0,
    unreadAlerts: 0,
  });

  // Notification dropdown state
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { id: 'tickets', label: 'All Tickets', icon: <TicketIcon /> },
    { id: 'users', label: 'Contractors', icon: <PeopleIcon /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertIcon /> },
    { id: 'import', label: 'Import Tickets', icon: <ImportIcon /> },
  ];

  useEffect(() => {
    // Load dashboard stats
    loadStats();
  }, []);

  // Sync selectedTab with URL parameters
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== selectedTab) {
      setSelectedTab(tabFromUrl);
    }
  }, [searchParams, selectedTab]);

  const loadStats = async () => {
    try {
      // Get real alerts stats from backend
      const alertsResponse = await axios.get('/alerts/stats');
      const alertsStats = alertsResponse.data.stats;

      // Get ticket stats (keeping existing logic for tickets)
      setStats({
        totalTickets: 25, // TODO: Replace with real ticket stats API
        openTickets: 18,
        expiredTickets: 3,
        closedTickets: 4,
        unreadAlerts: alertsStats.unread || 0, // Real unread count from backend
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to mock data if API fails
      setStats({
        totalTickets: 25,
        openTickets: 18,
        expiredTickets: 3,
        closedTickets: 4,
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
    logout();
  };

  const switchToContractor = () => {
    // DEV MODE: Switch to contractor view
    window.location.href = '/contractor';
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
      // Fallback to mock data
      setUnreadAlerts([
        {
          _id: '1',
          type: 'expiring_soon',
          message: 'Ticket TKT-2024-001 will expire in 2 hours',
          severity: 'high',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          ticketId: { ticketNumber: 'TKT-2024-001' }
        },
        {
          _id: '2',
          type: 'expired',
          message: 'Ticket TKT-2024-004 has expired',
          severity: 'critical',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          ticketId: { ticketNumber: 'TKT-2024-004' }
        }
      ]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAlertAsRead = async (alertId) => {
    try {
      await axios.put(`/alerts/${alertId}`, { isRead: true });
      // Refresh alerts and stats to update the badge count
      loadUnreadAlerts();
      await loadStats();
    } catch (error) {
      console.error('Error marking alert as read:', error);
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

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    // Update URL with the selected tab
    setSearchParams({ tab: tabId });
    handleDrawerClose();
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'tickets':
        return <TicketManagement isAdmin={true} />;
      case 'users':
        return <Contractors />;
      case 'alerts':
        return <AlertManagement />;
      case 'import':
        return <ImportTickets />;
      default:
        return <DashboardOverview />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <AdminIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" noWrap>
              Nova Underground
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Management Portal
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
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
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
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
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
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            '&:hover': {
              backgroundColor: '#ffcdd2',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon sx={{ color: '#d32f2f' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Sign Out"
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#d32f2f',
            }}
          />
        </ListItemButton>
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
            borderBottom: '1px solid #e3f2fd',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(10px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
            }
          }}
        >
                  <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                color: '#1976d2',
                backgroundColor: '#f3f8ff',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
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
                  {selectedTab === 'overview' && 'System overview and analytics'}
                  {selectedTab === 'tickets' && 'Manage all tickets and assignments'}
                  {selectedTab === 'users' && 'Contractor management and permissions'}
                  {selectedTab === 'alerts' && 'System alerts and notifications'}
                  {selectedTab === 'import' && 'Import tickets from external sources'}
                </Typography>
              </Box>
              
              {/* Mobile breadcrumb */}
              {isMobile && (
                <Chip 
                  label="Admin" 
                  size="small" 
                  sx={{ 
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    border: '1px solid #bbdefb'
                  }}
                />
              )}
            </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="inherit"
                onClick={handleNotificationClick}
                sx={{
                  color: '#1976d2',
                  backgroundColor: '#f3f8ff',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                <Badge 
                  badgeContent={stats.unreadAlerts} 
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
            Notifications
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
                <MuiMenuItem
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
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      py: 0.5,
                      fontSize: '0.75rem',
                      ml: 1
                    }}
                  >
                    Mark Read
                  </Button>
                </MuiMenuItem>
                {index < unreadAlerts.length - 1 && <MuiDivider />}
              </React.Fragment>
            ))
          )}
        </MenuList>

        {unreadAlerts.length > 0 && (
          <>
            <MuiDivider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                onClick={() => {
                  setSelectedTab('alerts');
                  handleNotificationClose();
                  setSearchParams({ tab: 'alerts' });
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
          p: { xs: 1.5, sm: 2, md: 3 },
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
    </Box>
  );
};

export default AdminDashboard;
