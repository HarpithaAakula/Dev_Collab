import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { getSocket } from '../services/socketService';



export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useContext(AuthContext);
  
  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userInfo) return;
    
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('http://localhost:5000/api/notifications', config);
      
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!userInfo) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.put(`/api/notifications/${notificationId}/read`, {}, config);
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userInfo || unreadCount === 0) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.put('/api/notifications/read-all', {}, config);
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!userInfo) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.delete(`/api/notifications/${notificationId}`, config);
      
      // Update local state
      const updatedNotifications = notifications.filter(
        notification => notification._id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const removedNotification = notifications.find(n => n._id === notificationId);
      if (removedNotification && !removedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Listen for real-time notifications
  useEffect(() => {
    if (!userInfo) return;
    
    const socket = getSocket();
    if (!socket) return;
    
    // Join notification room
    socket.emit('join_notifications', { userId: userInfo._id });
    
    // Handler for new notifications
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Optional: Show toast notification
      // toast.info(notification.message);
    };
    
    // Subscribe to notification events
    socket.on('notification', handleNewNotification);
    
    // Fetch initial notifications
    fetchNotifications();
    
    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [userInfo]);
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>);
};

// Custom hook to use the NotificationContext
export const useNotifications = () => {
  return useContext(NotificationContext);
};