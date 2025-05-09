const express = require('express');
const router = express.Router();
const { connectedUsers } = require('../controllers/socketController');

// Test endpoint to send a message to a specific user
router.post('/send-test-message', (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }

  const socketId = connectedUsers.get(userId);
  
  if (!socketId) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get the io instance from the request
  const io = req.app.get('io');
  
  // Send the message to the specific user
  io.to(socketId).emit('test_message', {
    message,
    timestamp: new Date().toISOString()
  });

  res.json({ 
    success: true, 
    message: 'Test message sent',
    socketId,
    connectedUsers: Array.from(connectedUsers.entries())
  });
});

module.exports = router; 