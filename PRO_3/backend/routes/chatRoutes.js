const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMessages, sendMessage } = require('../controllers/chatController');

const router = express.Router();

router.get('/:problemId', protect, getMessages);
router.post('/:problemId', protect, sendMessage);

module.exports = router;