import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode, forwardGeocode, isWithinUS } from '../utils/geocoding';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map interactions
const MapController = ({ center, onLocationSelect, selectedLocation, addressData }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);

  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
      <Popup>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
            Selected Location
          </Typography>
          
          {addressData ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                {addressData.fullAddress}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Chip 
                  label={addressData.city} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={addressData.state} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
                {addressData.zipCode && (
                  <Chip 
                    label={addressData.zipCode} 
                    size="small" 
                    color="default" 
                    variant="outlined"
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2">
              <strong>Coordinates:</strong><br />
              Lat: {selectedLocation.lat.toFixed(6)}<br />
              Lng: {selectedLocation.lng.toFixed(6)}
            </Typography>
          )}
        </Box>
      </Popup>
    </Marker>
  ) : null;
};

const LocationPicker = ({ open, onClose, onLocationSelect, initialLocation = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [addressData, setAddressData] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setMapCenter([initialLocation.lat, initialLocation.lng]);
      // If initial location has address data, set it
      if (initialLocation.address) {
        setAddressData(initialLocation.address);
      }
    }
  }, [initialLocation]);

  const handleLocationSelect = async (lat, lng) => {
    const location = { lat, lng };
    setSelectedLocation(location);
    setError('');
    
    // Perform reverse geocoding
    try {
      setLoading(true);
      const address = await reverseGeocode(lat, lng);
      setAddressData(address);
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      setAddressData(null);
      // Don't show error for reverse geocoding failures, just use coordinates
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await handleLocationSelect(latitude, longitude);
        setMapCenter([latitude, longitude]);
      },
      (error) => {
        setError('Unable to retrieve your location. Please try again.');
        setLoading(false);
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await forwardGeocode(searchQuery);
      const { coordinates, address } = result;
      
      setSelectedLocation(coordinates);
      setAddressData(address);
      setMapCenter([coordinates.lat, coordinates.lng]);
    } catch (err) {
      setError('Location not found. Please try a different search term.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      const locationWithAddress = {
        ...selectedLocation,
        address: addressData
      };
      onLocationSelect(locationWithAddress);
      onClose();
    }
  };

  const handleClear = () => {
    setSelectedLocation(null);
    setAddressData(null);
    setSearchQuery('');
    setError('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '800px',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Select Location
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Search and Controls */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="outlined"
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
            >
              Search
            </Button>
            <Tooltip title="Use current location">
              <Button
                variant="outlined"
                onClick={handleGetCurrentLocation}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <MyLocationIcon />}
              >
                Current
              </Button>
            </Tooltip>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {selectedLocation && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  <strong>Selected Location:</strong>
                </Typography>
                <Button size="small" onClick={handleClear} color="error" startIcon={<RefreshIcon />}>
                  Clear
                </Button>
              </Box>
              
              {addressData ? (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 1, 
                  border: '1px solid #e9ecef' 
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#1976d2' }}>
                    {addressData.fullAddress}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    <Chip 
                      label={addressData.city} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={addressData.state} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                    {addressData.zipCode && (
                      <Chip 
                        label={addressData.zipCode} 
                        size="small" 
                        color="default" 
                        variant="outlined"
                      />
                    )}
                    {!isWithinUS(selectedLocation.lat, selectedLocation.lng) && (
                      <Chip 
                        label="Outside US" 
                        size="small" 
                        color="warning" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 1, 
                  border: '1px solid #e9ecef' 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </Typography>
                  {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Getting address...
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Click on the map to select a location, or search for a specific address.
          </Typography>
        </Box>

        {/* Map */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController
              center={mapCenter}
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              addressData={addressData}
            />
          </MapContainer>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedLocation}
          color="primary"
        >
          Select Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationPicker;

