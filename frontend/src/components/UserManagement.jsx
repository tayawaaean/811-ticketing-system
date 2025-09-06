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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  Switch,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as ContractorIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Close as CloseIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import useUsers from '../hooks/useUsers';
import axios from 'axios';

const Contractors = () => {
  const { user } = useAuth();
  const { users, loading, error, createUser, updateUser, deleteUser, refreshUsers } = useUsers(user?.role);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Contractor',
    isActive: true,
  });

  // Users are automatically loaded by the useUsers hook

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'Contractor',
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleEditUser = (userData) => {
    setEditingUser(userData);
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: '', // Don't pre-fill password
      role: userData.role,
      isActive: userData.isActive,
    });
    setOpenDialog(true);
  };

  const validateForm = () => {
    const errors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation (only for new users)
    if (!editingUser) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setValidationErrors({});
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'Contractor',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const userData = { ...formData };

    // Don't send empty password for updates
    if (editingUser && !userData.password) {
      delete userData.password;
    }

    let result;
    if (editingUser) {
      result = await updateUser(editingUser._id, userData);
    } else {
      result = await createUser(userData);
    }

    if (result.success) {
      setSnackbar({
        open: true,
        message: editingUser ? 'Contractor updated successfully' : 'Contractor created successfully',
        severity: 'success',
      });
      handleCloseDialog();
    } else {
      setSnackbar({
        open: true,
        message: result.error,
        severity: 'error',
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await deleteUser(userId);
    
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Contractor deleted successfully',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error,
        severity: 'error',
      });
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    const result = await updateUser(userId, { isActive: !currentStatus });
    
    if (result.success) {
      setSnackbar({
        open: true,
        message: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error,
        severity: 'error',
      });
    }
  };


  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Contractor': return 'primary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <AdminIcon />;
      case 'Contractor': return <ContractorIcon />;
      default: return <PersonIcon />;
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusIcon = (isActive) => {
    return isActive ? <ActiveIcon /> : <InactiveIcon />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.75rem', sm: '2rem' },
            letterSpacing: '-0.02em'
          }}
        >
          Contractors
        </Typography>
        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshUsers}
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
            onClick={handleCreateUser}
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
            Add Contractor
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
                    Total Contractors
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {users.length}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Admins
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {users.filter(u => u.role === 'Admin').length}
                  </Typography>
                </Box>
                <AdminIcon sx={{ fontSize: 40, color: 'error.main' }} />
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
                    Contractors
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {users.filter(u => u.role === 'Contractor').length}
                  </Typography>
                </Box>
                <ContractorIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Active Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {users.filter(u => u.isActive).length}
                  </Typography>
                </Box>
                <ActiveIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
        {users
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((user) => (
            <Card
              key={user._id}
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
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      backgroundColor: user.role === 'Admin' ? '#ffebee' : '#e3f2fd',
                      color: user.role === 'Admin' ? '#d32f2f' : '#1976d2',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>

                <Box mb={1}>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mb: 0.5 }}>
                    <strong>Email:</strong> {user.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mb: 0.5 }}>
                    <strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: user.isActive ? '#e8f5e8' : '#ffebee',
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
                          backgroundColor: user.isActive ? '#2e7d32' : '#d32f2f'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>

                  <Box display="flex" gap={0.5}>
                    <Tooltip title="Edit Contractor">
                      <IconButton
                        onClick={() => handleEditUser(user)}
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
                    <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                      <IconButton
                        onClick={() => handleToggleUserStatus(user)}
                        size="small"
                        sx={{
                          color: user.isActive ? '#f57c00' : '#2e7d32',
                          '&:hover': {
                            backgroundColor: user.isActive ? '#fff3e0' : '#e8f5e8'
                          }
                        }}
                      >
                        {user.isActive ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
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
            minWidth: 650,
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
                    width: '22%'
                  }}
                >
                  Contractor
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #e3f2fd',
                    width: '22%'
                  }}
                >
                  Email
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
                  Role
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((userData) => (
                  <TableRow 
                    key={userData._id} 
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
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: getRoleColor(userData.role) === 'error' ? '#d32f2f' : '#1976d2',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}
                        >
                          {userData.firstName.charAt(0)}
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
                            {userData.firstName} {userData.lastName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#666666',
                              fontSize: '0.75rem'
                            }}
                          >
                            ID: {userData._id.slice(-8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1a1a1a',
                          fontWeight: 500
                        }}
                      >
                        {userData.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        icon={getRoleIcon(userData.role)}
                        label={userData.role}
                        size="small"
                        sx={{
                          backgroundColor: `${getRoleColor(userData.role) === 'error' ? '#ffebee' : '#e3f2fd'}`,
                          color: `${getRoleColor(userData.role) === 'error' ? '#d32f2f' : '#1976d2'}`,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: `1px solid ${getRoleColor(userData.role) === 'error' ? '#ffcdd2' : '#bbdefb'}`,
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
                            backgroundColor: `${getStatusColor(userData.isActive) === 'success' ? '#e8f5e8' : '#ffebee'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getStatusIcon(userData.isActive)}
                        </Box>
                        <Chip
                          label={userData.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(userData.isActive) === 'success' ? '#e8f5e8' : '#ffebee'}`,
                            color: `${getStatusColor(userData.isActive) === 'success' ? '#2e7d32' : '#d32f2f'}`,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: `1px solid ${getStatusColor(userData.isActive) === 'success' ? '#c8e6c9' : '#ffcdd2'}`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        />
                      </Box>
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
                        {formatDate(userData.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Box display="flex" gap={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit Contractor">
                          <IconButton
                            onClick={() => handleEditUser(userData)}
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
                        <Tooltip title={userData.isActive ? 'Deactivate User' : 'Activate User'}>
                          <IconButton
                            onClick={() => handleToggleActive(userData._id, userData.isActive)}
                            size="small"
                            sx={{
                              color: userData.isActive ? '#f57c00' : '#2e7d32',
                              '&:hover': {
                                backgroundColor: userData.isActive ? '#fff3e0' : '#e8f5e8',
                                color: userData.isActive ? '#ef6c00' : '#1b5e20'
                              }
                            }}
                          >
                            {userData.isActive ? <InactiveIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Contractor">
                          <IconButton
                            onClick={() => handleDeleteUser(userData._id)}
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
        </Table>
      </TableContainer>
    </Card>

    {/* Pagination - Works for both mobile and desktop */}
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component="div"
      count={users.length}
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
        borderRadius: 2,
        mt: 2,
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
              maxHeight: '90vh',
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
              py: 3,
              px: 3,
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 1, color: '#1F2937' }}>
                {editingUser ? 'Edit Contractor Account' : 'Create New Contractor Account'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.9rem' }}>
                {editingUser ? 'Update contractor information and permissions' : 'Add a new contractor to the system'}
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

        <DialogContent sx={{ p: 3, overflow: 'visible', backgroundColor: '#FFFFFF' }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                error={!!validationErrors.firstName}
                helperText={validationErrors.firstName}
                placeholder="First Name"
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName}
                placeholder="Last Name"
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
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                placeholder="example@gmail.com"
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                error={!!validationErrors.password}
                helperText={validationErrors.password || (editingUser ? "Leave empty to keep current password" : "Required for new users")}
                placeholder="Password"
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>User Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="User Role"
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
                  <MenuItem value="Admin">Administrator</MenuItem>
                  <MenuItem value="Contractor">Contractor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                border: '2px solid',
                borderColor: formData.isActive ? '#4CAF50' : '#F44336',
                borderRadius: 2,
                backgroundColor: formData.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                height: '40px', // Match small TextField height
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: formData.isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      color="success"
                      size="small"
                      sx={{
                        '& .MuiSwitch-thumb': {
                          backgroundColor: formData.isActive ? '#4CAF50' : '#F44336',
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: formData.isActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
                        },
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: formData.isActive 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' 
                            : 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {formData.isActive ? (
                          <ActiveIcon sx={{ fontSize: 12, color: 'white' }} />
                        ) : (
                          <InactiveIcon sx={{ fontSize: 12, color: 'white' }} />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ 
                        fontSize: '0.8rem',
                        color: formData.isActive ? '#2E7D32' : '#C62828'
                      }}>
                        {formData.isActive ? 'Active User' : 'Inactive User'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          gap: 2, 
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
            {editingUser ? 'Update' : 'Create'}
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

export default Contractors;
