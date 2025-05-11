const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getLeaderboard,
  getUserGamificationStatus,
  getBadgeDetails
} = require('../controllers/gamificationController');

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const leaderboard = await getLeaderboard(limit, skip);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// @desc    Get user's gamification status
// @route   GET /api/gamification/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const status = await getUserGamificationStatus(req.user._id);
    res.json(status);
  } catch (error) {
    console.error('Error fetching user gamification status:', error);
    res.status(500).json({ message: 'Error fetching gamification status' });
  }
});

// @desc    Get badge details
// @route   GET /api/gamification/badges
// @access  Public
router.get('/badges', async (req, res) => {
  try {
    const badges = await getBadgeDetails();
    res.json(badges);
  } catch (error) {
    console.error('Error fetching badge details:', error);
    res.status(500).json({ message: 'Error fetching badge details' });
  }
});

module.exports = router; 