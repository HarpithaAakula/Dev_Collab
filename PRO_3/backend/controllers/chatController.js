const Chat = require('../models/chatModel');
const Problem = require('../models/problemModel');
const { createNotification } = require('./notificationController');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Send a chat message
// @route   POST /api/chat/:problemId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const problemId = req.params.problemId;

  if (!req.user?._id) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  if (!content || content.trim() === '') {
    res.status(400);
    throw new Error('Message content is required');
  }

  // Verify problem exists
  const problem = await Problem.findById(problemId);
  if (!problem) {
    res.status(404);
    throw new Error('Problem not found');
  }

  const message = await Chat.create({
    problem: problemId, // Make sure your schema uses `problem`, not `problemId`
    user: req.user._id,
    userName: req.user.name,
    content,
  });

  const io = req.io || req.app.get('io');
  if (io) {
    io.to(`problem_${problemId}`).emit('new_message', message); // emit to room
  }

  // Send notification if sender is not the problem owner
  if (problem.user.toString() !== req.user._id.toString()) {
    await createNotification({
      recipient: problem.user,
      sender: req.user._id,
      problemId: problem._id,
      type: 'new_message',
      message: `${req.user.name} sent a message on your problem: ${problem.title}`,
      relatedItemId: message._id,
    });

    if (io) {
      io.to(`user_${problem.user.toString()}`).emit('notification', {
        type: 'new_message',
        message: `${req.user.name} sent a message regarding your problem`,
        problemId: problem._id,
        messageId: message._id,
      });
    }
  }

  res.status(201).json(message);
});

// @desc    Get chat messages for a problem
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

  const messages = await Chat.find({ problem: problemId }) // assuming `problem` is the field in Chat schema
    .populate('user', 'name email') // if your schema references user
    .sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = {
  sendMessage,
  getMessages,
};
