import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../context/notificationContext';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { BsTrash, BsCheckCircle } from 'react-icons/bs';

const Notifications = () => {
  const { 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useContext(NotificationContext);

  useEffect(() => {
    // Refresh notifications when component mounts
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle read notification
  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  // Handle notification deletion
  const handleDelete = (id) => {
    deleteNotification(id);
  };

  // Get relative time string
  const getTimeString = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  // Determine link path based on notification type
  const getNotificationPath = (notification) => {
    const { type, problemId } = notification;
    
    switch (type) {
      case 'new_solution':
      case 'solution_accepted':
      case 'solution_voted':
        return `/problems/${problemId}`;
      case 'new_message':
        return `/collaborate/${problemId}`;
      default:
        return '#';
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Notifications</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-primary" 
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.isRead)}
          >
            Mark all as read
          </Button>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No notifications yet</h5>
          <p>When you receive notifications, they will appear here.</p>
        </div>
      ) : (
        <div className="notification-list-container">
          {notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`notification-item-full ${!notification.isRead ? 'unread' : ''}`}
            >
              <Row className="align-items-center">
                <Col xs={12} md={9}>
                  <Link 
                    to={getNotificationPath(notification)}
                    className="notification-link"
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="notification-content-full">
                      <p className="notification-message">{notification.message}</p>
                      <small className="text-muted">{getTimeString(notification.createdAt)}</small>
                    </div>
                  </Link>
                </Col>
                <Col xs={12} md={3} className="text-end action-buttons">
                  {!notification.isRead && (
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      <BsCheckCircle />
                    </Button>
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(notification._id)}
                    title="Delete notification"
                  >
                    <BsTrash />
                  </Button>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Notifications;