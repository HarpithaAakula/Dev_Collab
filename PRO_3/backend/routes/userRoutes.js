

const express = require('express');
const { registerUser, authUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');  // ✅ Move import to the top
const User = require('../models/userModel');  // ✅ Import User model

const router = express.Router();

// Register and login routes
router.post('/', registerUser);
router.post('/login', authUser);

// ✅ Move the /profile route inside the module.exports block
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id); 
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        expertise: user.expertise,
        points: user.points,
        bio: user.bio,
        github: user.github,
        profileImage: user.profileImage,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; // ✅ Export after defining all routes
