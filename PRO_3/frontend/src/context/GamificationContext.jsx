import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { getSocket } from '../services/socketService';

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
  const { userInfo } = useContext(AuthContext);
  const [userPoints, setUserPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial gamification status
  const fetchGamificationStatus = async () => {
    if (!userInfo?.token) return;

    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('http://localhost:5000/api/gamification/status', config);
      setUserPoints(data.points);
      setUserBadges(data.badges);
    } catch (error) {
      console.error('Error fetching gamification status:', error);
      setError('Failed to load gamification status');
    } finally {
      setLoading(false);
    }
  };

  // Listen for real-time updates
  useEffect(() => {
    if (!userInfo) return;

    const socket = getSocket();
    if (!socket) return;

    // Handle points updates
    const handlePointsUpdate = ({ points }) => {
      setUserPoints(prevPoints => prevPoints + points);
    };

    // Handle badge updates
    const handleBadgesEarned = ({ badges, points }) => {
      setUserBadges(prevBadges => [...prevBadges, ...badges]);
      if (points) {
        setUserPoints(prevPoints => prevPoints + points);
      }
    };

    // Handle combined gamification updates
    const handleGamificationUpdate = ({ points, newBadges }) => {
      if (points) {
        setUserPoints(prevPoints => prevPoints + points);
      }
      if (newBadges?.length > 0) {
        setUserBadges(prevBadges => [...prevBadges, ...newBadges]);
      }
    };

    // Subscribe to socket events
    socket.on('points_updated', handlePointsUpdate);
    socket.on('badges_earned', handleBadgesEarned);
    socket.on('gamification_update', handleGamificationUpdate);

    // Fetch initial status
    fetchGamificationStatus();

    return () => {
      socket.off('points_updated', handlePointsUpdate);
      socket.off('badges_earned', handleBadgesEarned);
      socket.off('gamification_update', handleGamificationUpdate);
    };
  }, [userInfo]);

  // Get leaderboard data
  const getLeaderboard = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(
        `http://localhost:5000/api/gamification/leaderboard?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get all available badges
  const getAllBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('http://localhost:5000/api/gamification/badges');
      return data;
    } catch (error) {
      console.error('Error fetching badges:', error);
      setError('Failed to load badges');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific badge
  const hasBadge = (badgeId) => {
    return userBadges.some(badge => badge.id === badgeId);
  };

  // Get user's rank (if implemented in the backend)
  const getUserRank = async () => {
    if (!userInfo?.token) return null;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/gamification/rank', config);
      return data.rank;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  };

  const value = {
    userPoints,
    userBadges,
    loading,
    error,
    getLeaderboard,
    getAllBadges,
    hasBadge,
    getUserRank,
    refreshStatus: fetchGamificationStatus
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

// Custom hook to use the GamificationContext
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};