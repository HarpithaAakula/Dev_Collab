import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { getSocket, onGamificationUpdate, onNotification } from '../services/socketService';

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
  const { userInfo } = useContext(AuthContext);
  const [userPoints, setUserPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState({ progressPoints: 0, requiredPoints: 100, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

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
      setUserPoints(data.points || 0);
      setUserBadges(data.badges || []);
      setUserRank(data.rank || null);
      
      // Calculate level and progress
      const level = Math.floor(data.points / 100) + 1;
      const currentLevelPoints = (level - 1) * 100;
      const nextLevelPoints = level * 100;
      const progressPoints = data.points - currentLevelPoints;
      const requiredPoints = nextLevelPoints - currentLevelPoints;
      
      setUserLevel(level);
      setLevelProgress({
        progressPoints,
        requiredPoints,
        percentage: Math.round((progressPoints / requiredPoints) * 100)
      });
      
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

    // Handle gamification updates
    const handleGamificationUpdate = ({ points, totalPoints, newBadges }) => {
      console.log('Gamification update received:', { points, totalPoints, newBadges });
      
      if (totalPoints !== undefined) {
        setUserPoints(totalPoints);
        
        // Update level and progress
        const level = Math.floor(totalPoints / 100) + 1;
        const currentLevelPoints = (level - 1) * 100;
        const nextLevelPoints = level * 100;
        const progressPoints = totalPoints - currentLevelPoints;
        const requiredPoints = nextLevelPoints - currentLevelPoints;
        
        setUserLevel(level);
        setLevelProgress({
          progressPoints,
          requiredPoints,
          percentage: Math.round((progressPoints / requiredPoints) * 100)
        });
      }
      
      if (newBadges && newBadges.length > 0) {
        setUserBadges(prevBadges => {
          const existingIds = prevBadges.map(badge => badge.id);
          const uniqueNewBadges = newBadges.filter(badge => !existingIds.includes(badge.id));
          return [...prevBadges, ...uniqueNewBadges];
        });
      }
    };

    // Handle notifications
    const handleNotification = (notification) => {
      console.log('Notification received:', notification);
      setNotifications(prev => [
        { ...notification, id: Date.now(), timestamp: new Date() },
        ...prev.slice(0, 9) // Keep only 10 most recent notifications
      ]);

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    // Subscribe to socket events
    const unsubscribeGamification = onGamificationUpdate(handleGamificationUpdate);
    const unsubscribeNotifications = onNotification(handleNotification);

    // Fetch initial status
    fetchGamificationStatus();

    return () => {
      unsubscribeGamification();
      unsubscribeNotifications();
    };
  }, [userInfo]);

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Remove specific notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

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
      setUserRank(data.rank);
      return data.rank;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  };

  // Get points needed for next badge
  const getNextBadgeProgress = () => {
    // This would need to be implemented based on your badge requirements
    // For now, returning a simple example
    const pointMilestones = [100, 250, 500, 1000, 2500, 5000];
    const nextMilestone = pointMilestones.find(milestone => milestone > userPoints);
    
    if (nextMilestone) {
      const progress = (userPoints / nextMilestone) * 100;
      return {
        nextMilestone,
        progress: Math.round(progress),
        pointsNeeded: nextMilestone - userPoints
      };
    }
    
    return null;
  };

  const value = {
    userPoints,
    userBadges,
    userRank,
    userLevel,
    levelProgress,
    loading,
    error,
    notifications,
    getLeaderboard,
    getAllBadges,
    hasBadge,
    getUserRank,
    getNextBadgeProgress,
    refreshStatus: fetchGamificationStatus,
    clearNotifications,
    removeNotification
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