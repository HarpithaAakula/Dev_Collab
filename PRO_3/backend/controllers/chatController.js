const Message = require('../models/chatModel');
const User = require('../models/userModel');
const Problem = require('../models/problemModel');
const asyncHandler = require('express-async-handler');

// @desc    Get all messages for a specific problem
// @route   GET /api/chat/:problemId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  // Verify problem exists
  const problemExists = await Problem.findById(problemId);
  if (!problemExists) {
    res.status(404);
    throw new Error('Problem not found');
  }

  const messages = await Message.find({ problemId })
    .sort({ createdAt: 1 });

  res.json(messages);
});

// @desc    Send a new message
// @route   POST /api/chat/:problemId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    res.status(400);
    throw new Error('Message content is required');
  }

  // Verify problem exists
  const problemExists = await Problem.findById(problemId);
  if (!problemExists) {
    res.status(404);
    throw new Error('Problem not found');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const message = await Message.create({
    problemId,
    user: req.user._id,
    userName: user.name,
    content
  });

  // Emit to socket.io
  try {
    const io = req.app.get('io');
    if (io) {
      io.to(`problem_${problemId}`).emit('new_message', message);
    }
  } catch (error) {
    console.error('Socket.io error:', error);
    // Continue with the response even if socket emission fails
  }

  res.status(201).json(message);
});

module.exports = {
  getMessages,
  sendMessage
};