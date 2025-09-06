import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ContractorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/auth/me');
      setProfile(response.data.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load profile data',
        severity: 'error',
      });
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    loadProfile(); // Reset to original data
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/auth/profile', profile);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error',
      });
    }
    setLoading(false);
  };

  const handleChange = (field) => (event) => {
    setProfile({
      ...profile,
      [field]: event.target.value,
    });
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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your personal information
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box textAlign="center" mb={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.email}
                </Typography>
                <Chip
                  label="Contractor"
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Profile Information
                </Typography>
                {!editing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.firstName}
                    onChange={handleChange('firstName')}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.lastName}
                    onChange={handleChange('lastName')}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profile.email}
                    disabled
                    helperText="Email cannot be changed. Contact administrator for email changes."
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
              </Grid>

            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default ContractorProfile;
