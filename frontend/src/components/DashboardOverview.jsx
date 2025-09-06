import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Assignment as TicketIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useTickets from '../hooks/useTickets';

const RecentTicketsTable = ({ tickets }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#2e7d32';
      case 'Expired': return '#d32f2f';
      case 'Closed': return '#1976d2';
      default: return '#666666';
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      sx={{ 
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
        },
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        borderRadius: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}
        >
          Recent Tickets
        </Typography>
        <TableContainer component={Paper} sx={{
          boxShadow: 'none',
          backgroundColor: 'transparent',
          overflowX: 'auto',
          width: '100%'
        }}>
          <Table sx={{
            minWidth: 650,
            width: '100%'
          }} aria-label="recent tickets table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2 }}>Ticket ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2 }}>Contractor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets && tickets.length > 0 ? (
                tickets
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((ticket) => (
                  <TableRow 
                    key={ticket._id || ticket.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2', py: 2 }}>
                      {ticket.ticketNumber || `#${ticket._id || ticket.id}`}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={ticket.status}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(ticket.status)}20`,
                          color: getStatusColor(ticket.status),
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: `1px solid ${getStatusColor(ticket.status)}40`
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#666', fontSize: '0.875rem', py: 2 }}>
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.75rem',
                            backgroundColor: '#1976d2',
                            mr: 1
                          }}
                        >
                          {ticket.assignedTo?.firstName ? ticket.assignedTo.firstName.charAt(0).toUpperCase() : 
                           ticket.organization ? ticket.organization.charAt(0).toUpperCase() : 'C'}
                        </Avatar>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                          {ticket.assignedTo ? 
                            `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 
                            ticket.organization || 'Unassigned'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No tickets available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card
    sx={{
      height: '100%',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: { xs: 'none', sm: 'translateY(-4px)' },
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      },
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      borderRadius: { xs: 2, sm: 3 },
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderLeft: `4px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
      }
    }}
  >
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: color,
                mr: 1,
                boxShadow: `0 0 8px ${color}40`
              }}
            />
            <Typography
              color="text.secondary"
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#666666'
              }}
            >
              {title}
            </Typography>
          </Box>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            sx={{
              color: color,
              mb: 0.5,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              lineHeight: { xs: 1.1, sm: 1.2 }
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: '#666666',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            borderRadius: '50%',
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 15px ${color}40`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: { xs: 'none', sm: 'scale(1.1)' },
            }
          }}
        >
          {icon}
        </Box>
      </Box>
      {trend && (
        <Box mt={3}>
          <LinearProgress
            variant="determinate"
            value={trend}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                borderRadius: 4,
              }
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600,
              mt: 1,
              display: 'block',
              color: '#666666',
              fontSize: '0.75rem'
            }}
          >
            {trend}% of total
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const DashboardOverview = ({ isContractor = false }) => {
  const { tickets, stats, loading, error, refreshData } = useTickets();

  // Real alerts - you can implement real alerts system later
  const recentAlerts = [];

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="h6" color="text.secondary">
          Unable to load dashboard data. Please try refreshing the page.
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'success';
      case 'Expired': return 'error';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      case 'critical': return 'error';
      default: return 'default';
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

  if (isContractor) {
    return (
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
        py: { xs: 1, sm: 2 },
      }}>
        {/* Mobile-First Header */}
        <Box sx={{
          mb: { xs: 3, sm: 4 },
          width: '100%',
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
              lineHeight: { xs: 1.2, sm: 1.3 }
            }}
          >
            My Dashboard
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              fontWeight: 400,
              opacity: 0.8,
              lineHeight: 1.4,
              maxWidth: { xs: '100%', sm: '80%', md: '60%' },
              mx: { xs: 'auto', sm: 0 }
            }}
          >
            Overview of your assigned tickets and alerts
          </Typography>
        </Box>

        {/* Mobile-First Stats Grid */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ mb: { xs: 3, sm: 4 }, width: '100%' }}>
                  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="My Tickets"
            value={stats.total}
            icon={<TicketIcon sx={{ color: 'white' }} />}
            color="#1976d2"
            subtitle="Total assigned"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }} >
          <StatCard
            title="Open Tickets"
            value={stats.open}
            icon={<ScheduleIcon sx={{ color: 'white' }} />}
            color="#2e7d32"
            subtitle="In progress"
            trend={stats.total > 0 ? (stats.open / stats.total) * 100 : 0}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }} >
          <StatCard
            title="Expired Tickets"
            value={stats.expired}
            icon={<WarningIcon sx={{ color: 'white' }} />}
            color="#d32f2f"
            subtitle="Need attention"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }} >
          <StatCard
            title="Closed Tickets"
            value={stats.closed}
            icon={<CheckCircleIcon sx={{ color: 'white' }} />}
            color="#1976d2"
            subtitle="Completed"
          />
        </Grid>
        </Grid>

        {/* Mobile-First Content Cards */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-2px)' },
                  boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                },
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                borderRadius: { xs: 2, sm: 3 },
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                width: '100%',
                mb: { xs: 2, md: 0 }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3
                  }}
                >
                  My Workload Overview
                </Typography>
                <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Active', value: stats.open, fill: '#2e7d32' },
                        { name: 'Urgent', value: stats.expiringSoon, fill: '#f57c00' },
                        { name: 'Overdue', value: stats.expired, fill: '#d32f2f' },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} tickets`, 'Count']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        <Cell fill="url(#activeGradient)" />
                        <Cell fill="url(#urgentGradient)" />
                        <Cell fill="url(#overdueGradient)" />
                      </Bar>
                      <defs>
                        <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2e7d32" />
                          <stop offset="100%" stopColor="#1b5e20" />
                        </linearGradient>
                        <linearGradient id="urgentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f57c00" />
                          <stop offset="100%" stopColor="#ef6c00" />
                        </linearGradient>
                        <linearGradient id="overdueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d32f2f" />
                          <stop offset="100%" stopColor="#c62828" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#2e7d32',
                        fontSize: '1.5rem'
                      }}
                    >
                      {stats.open}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#666666',
                        fontSize: '0.875rem'
                      }}
                    >
                      Active
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#f57c00',
                        fontSize: '1.5rem'
                      }}
                    >
                      {stats.expiringSoon}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#666666',
                        fontSize: '0.875rem'
                      }}
                    >
                      Urgent
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#d32f2f',
                        fontSize: '1.5rem'
                      }}
                    >
                      {stats.expired}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#666666',
                        fontSize: '0.875rem'
                      }}
                    >
                      Overdue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{
              '& .MuiCard-root': {
                borderRadius: { xs: 2, sm: 3 },
                '& .MuiCardContent-root': {
                  p: { xs: 2, sm: 3 }
                }
              }
            }}>
              <RecentTicketsTable tickets={tickets} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Admin dashboard - Mobile First
  return (
    <Box sx={{
      width: '100%',
      maxWidth: '100%',
      px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
      py: { xs: 1, sm: 2 },
    }}>
      {/* Mobile-First Header */}
      <Box sx={{
        mb: { xs: 3, sm: 4 },
        width: '100%',
        textAlign: { xs: 'center', sm: 'left' }
      }}>
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: { xs: 1, sm: 2 },
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            lineHeight: { xs: 1.2, sm: 1.3 }
          }}
        >
          System Overview
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            fontWeight: 400,
            opacity: 0.8,
            lineHeight: 1.4,
            maxWidth: { xs: '100%', sm: '80%', md: '60%' },
            mx: { xs: 'auto', sm: 0 }
          }}
        >
          Complete system statistics and recent activity
        </Typography>
      </Box>

      {/* Mobile-First Stats Grid */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ mb: { xs: 3, sm: 4 }, width: '100%' }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Total Tickets"
            value={stats.total}
            icon={<TicketIcon sx={{ color: 'white' }} />}
            color="#1976d2"
            subtitle="All time"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Open Tickets"
            value={stats.open}
            icon={<ScheduleIcon sx={{ color: 'white' }} />}
            color="#2e7d32"
            subtitle="In progress"
            trend={stats.total > 0 ? (stats.open / stats.total) * 100 : 0}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Expired Tickets"
            value={stats.expired}
            icon={<WarningIcon sx={{ color: 'white' }} />}
            color="#d32f2f"
            subtitle="Need attention"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Closed Tickets"
            value={stats.closed}
            icon={<CheckCircleIcon sx={{ color: 'white' }} />}
            color="#1976d2"
            subtitle="Completed"
          />
        </Grid>
      </Grid>

      {/* Mobile-First Content Cards */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
              },
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              borderRadius: { xs: 2, sm: 3 },
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              width: '100%',
              mb: { xs: 2, md: 0 }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Ticket Status Distribution
              </Typography>
              <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, mt: { xs: 1, sm: 2 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Open', value: stats.open, fill: '#2e7d32' },
                        { name: 'Expired', value: stats.expired, fill: '#d32f2f' },
                        { name: 'Closed', value: stats.closed, fill: '#1976d2' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={{ xs: 40, sm: 60 }}
                      outerRadius={{ xs: 70, sm: 100 }}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="url(#openGradient)" />
                      <Cell fill="url(#expiredGradient)" />
                      <Cell fill="url(#closedGradient)" />
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} tickets`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="openGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2e7d32" />
                        <stop offset="100%" stopColor="#1b5e20" />
                      </linearGradient>
                      <linearGradient id="expiredGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#d32f2f" />
                        <stop offset="100%" stopColor="#c62828" />
                      </linearGradient>
                      <linearGradient id="closedGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1976d2" />
                        <stop offset="100%" stopColor="#1565c0" />
                      </linearGradient>
                    </defs>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-around',
                mt: { xs: 2, sm: 3 },
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 0 }
              }}>
                <Box sx={{ textAlign: 'center', flex: { xs: '1 1 30%', sm: 'none' } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#2e7d32',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    {stats.open}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#666666',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Open
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: { xs: '1 1 30%', sm: 'none' } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#f57c00',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    {stats.expired}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#666666',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Expired
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: { xs: '1 1 30%', sm: 'none' } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#1976d2',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    {stats.closed}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#666666',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Closed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{
            '& .MuiCard-root': {
              borderRadius: { xs: 2, sm: 3 },
              '& .MuiCardContent-root': {
                p: { xs: 2, sm: 3 }
              }
            }
          }}>
            <RecentTicketsTable tickets={tickets} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
