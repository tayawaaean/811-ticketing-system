import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUsers = (userRole = null) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users (Admin only)
  const fetchUsers = async () => {
    // Only fetch users if user is admin
    if (userRole !== 'Admin') {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/auth/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new user (Admin only)
  const createUser = async (userData) => {
    if (userRole !== 'Admin') {
      return { 
        success: false, 
        error: 'Only admins can create users' 
      };
    }

    try {
      const response = await axios.post('/auth/register', userData);
      await fetchUsers(); // Refresh the list
      return { success: true, data: response.data.data };
    } catch (err) {
      console.error('Error creating user:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to create user' 
      };
    }
  };

  // Update a user (Admin only)
  const updateUser = async (userId, userData) => {
    if (userRole !== 'Admin') {
      return { 
        success: false, 
        error: 'Only admins can update users' 
      };
    }

    try {
      const response = await axios.put(`/auth/users/${userId}`, userData);
      await fetchUsers(); // Refresh the list
      return { success: true, data: response.data.data };
    } catch (err) {
      console.error('Error updating user:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update user' 
      };
    }
  };

  // Delete a user (Admin only)
  const deleteUser = async (userId) => {
    if (userRole !== 'Admin') {
      return { 
        success: false, 
        error: 'Only admins can delete users' 
      };
    }

    try {
      await axios.delete(`/auth/users/${userId}`);
      await fetchUsers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete user' 
      };
    }
  };

  // Refresh data
  const refreshUsers = () => {
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  };
};

export default useUsers;
