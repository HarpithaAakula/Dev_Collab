const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected - require authentication
router.use(protect);

// Get all user notifications
router.route('/').get(getUserNotifications);

// Mark all notifications as read
router.route('/read-all').put(markAllNotificationsRead);

// Mark specific notification as read
router.route('/:id/read').put(markNotificationRead);

// Delete a notification
router.route('/:id').delete(deleteNotification);

module.exports = router;