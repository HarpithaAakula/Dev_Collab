import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../../context/notificationContext';
import { BsBell, BsBellFill } from 'react-icons/bs';
import './Notifications.css';

const NotificationIcon = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications  } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button 
        className="notification-icon-button" 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications(); // fetch when opening
        }}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? <BsBellFill /> : <BsBell />}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read" 
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {!notifications ? (
              <div className="no-notifications">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <Link
                  key={notification._id}
                  to={
                    notification.type === 'new_solution' || notification.type === 'solution_accepted' || notification.type === 'solution_voted'
                      ? `/problems/${notification.problemId._id || notification.problemId}`
                      : notification.type === 'new_message'
                      ? `/collaborate/${notification.problemId._id || notification.problemId}`
                      : '#'
                  }
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {notifications && notifications.length > 10 && (
            <Link 
              to="/notifications" 
              className="view-all-notifications"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;