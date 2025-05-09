const Chat = require('../models/chatModel');
const Problem = require('../models/problemModel');
const { createNotification } = require('./notificationController');

// @desc    Send a chat message
// @route   POST /api/chat/:problemId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const problemId = req.params.problemId;
    
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Create the message
    const message = await Chat.create({
      problem: problemId,
      sender: req.user._id,
      content,
    });
    
    await message.populate('sender', 'name email');
    
    // Emit to socket room for real-time updates
    req.io?.to(`problem_${problemId}`).emit('new_chat_message', message);
    
    // Create notification if message is for problem owner
    if (problem.user.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: problem.user,
        sender: req.user._id,
        problemId: problem._id,
        type: 'new_message',
        message: `${req.user.name} sent a message on your problem: ${problem.title}`,
        relatedItemId: message._id
      });
      
      // Emit real-time notification
      req.io?.to(`user_${problem.user.toString()}`).emit('notification', {
        type: 'new_message',
        message: `${req.user.name} sent a message regarding your problem`,
        problemId: problem._id,
        messageId: message._id
      });
    }
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat messages for a problem
// @route   GET /api/chat/:problemId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Chat.find({ problem: req.params.problemId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};