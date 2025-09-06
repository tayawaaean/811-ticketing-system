import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    expired: 0,
    expiringSoon: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ticket statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/tickets/stats/overview');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching ticket stats:', err);
      setError('Failed to load ticket statistics');
    }
  };

  // Fetch recent tickets
  const fetchRecentTickets = async () => {
    try {
      const response = await axios.get('/tickets?limit=5&sortBy=createdAt&sortOrder=desc&populate=assignedTo');
      setTickets(response.data.data);
    } catch (err) {
      console.error('Error fetching recent tickets:', err);
      setError('Failed to load recent tickets');
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentTickets()
      ]);
    } catch (err) {
      console.error('Error fetching ticket data:', err);
      setError('Failed to load ticket data');
    } finally {
      setLoading(false);
    }
  };

  // Delete ticket
  const deleteTicket = async (ticketId) => {
    try {
      await axios.delete(`/tickets/${ticketId}`);
      // Refresh data after successful deletion
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error('Error deleting ticket:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete ticket' 
      };
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    tickets,
    stats,
    loading,
    error,
    refreshData,
    deleteTicket
  };
};

export default useTickets;
