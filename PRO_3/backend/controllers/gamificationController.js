const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const { calculatePoints, checkBadgeEligibility, BADGES } = require('../config/gamificationConfig');

// Get leaderboard data
const getLeaderboard = async (limit = 10, skip = 0) => {
  try {
    const users = await User.find()
      .select('name points badges profileImage')
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    // Get user ranks
    const leaderboard = await Promise.all(users.map(async (user, index) => {
      const rank = skip + index + 1;
      const badgeCount = user.badges.length;
      
      return {
        rank,
        userId: user._id,
        name: user.name,
        points: user.points,
        badgeCount,
        profileImage: user.profileImage,
        badges: user.badges.map(badgeId => BADGES[badgeId]).filter(Boolean)
      };
    }));

    return {
      leaderboard,
      pagination: {
        total: totalUsers,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(totalUsers / limit),
        limit
      }
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Get badge details
const getBadgeDetails = async () => {
  try {
    return Object.values(BADGES).map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      requirement: badge.requirement
    }));
  } catch (error) {
    console.error('Error getting badge details:', error);
    throw error;
  }
};

// Helper function to create a badge notification
const createBadgeNotification = async (userId, badgeId) => {
  try {
    const badge = BADGES[badgeId];
    if (!badge) return;

    const notification = new Notification({
      recipient: userId,
      type: 'badge_earned',
      message: `🏆 Congratulations! You've earned the "${badge.name}" badge! ${badge.description}`,
      isRead: false
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating badge notification:', error);
  }
};

// Helper function to update user points and check for badges
const updateUserPoints = async (userId, pointsToAdd, actionType, actionCount) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update points
    user.points += pointsToAdd;

    // Check for new badges
    const newBadges = checkBadgeEligibility(user, actionType, actionCount);
    if (newBadges.length > 0) {
      // Create notifications for each new badge
      for (const badgeId of newBadges) {
        await createBadgeNotification(userId, badgeId);
      }
      
      user.badges = [...user.badges, ...newBadges];
    }

    await user.save();
    return {
      updatedPoints: user.points,
      newBadges,
      user
    };
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

// Check and award badges based on user actions
const checkAndAwardBadges = async (userId, actionType, actionCount) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get current stats based on action type
    let currentCount = 0;
    switch (actionType) {
      case 'CHAT_MESSAGE':
        // You might want to store this in the user model or query from messages
        currentCount = actionCount;
        break;
      case 'JOIN_ROOM':
        currentCount = 1; // First time joining
        break;
      case 'TOTAL_POINTS':
        currentCount = user.points;
        break;
      case 'UNIQUE_LANGUAGES':
        currentCount = user.languages?.length || 0;
        break;
      case 'SOLVED_PROBLEMS':
        // You might want to store this in the user model or query from solutions
        currentCount = actionCount;
        break;
    }

    // Check for badges
    const newBadges = checkBadgeEligibility(user, actionType, currentCount);
    
    if (newBadges.length > 0) {
      // Create notifications for each new badge
      for (const badgeId of newBadges) {
        await createBadgeNotification(userId, badgeId);
      }
      
      // Update user's badges
      user.badges = [...user.badges, ...newBadges];
      await user.save();
    }

    return {
      newBadges,
      user
    };
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    throw error;
  }
};

// Award points for joining a collaboration room
const awardPointsForJoiningRoom = async (userId) => {
  try {
    const points = calculatePoints('JOIN_ROOM');
    const result = await updateUserPoints(userId, points, 'JOIN_ROOM', 1);
    
    // Check for First Collaborator badge
    await checkAndAwardBadges(userId, 'JOIN_ROOM', 1);
    
    return result;
  } catch (error) {
    console.error('Error awarding points for joining room:', error);
    throw error;
  }
};

// Award points for sending a chat message
const awardPointsForChatMessage = async (userId, currentDailyPoints = 0) => {
  try {
    const points = calculatePoints('CHAT_MESSAGE', currentDailyPoints);
    if (points <= 0) {
      return { message: 'Daily chat points limit reached' };
    }
    
    const result = await updateUserPoints(userId, points, 'CHAT_MESSAGE', 1);
    
    // Check for Chatty badge
    await checkAndAwardBadges(userId, 'CHAT_MESSAGE', 1);
    
    return result;
  } catch (error) {
    console.error('Error awarding points for chat message:', error);
    throw error;
  }
};

// Award points for submitting a solution
const awardPointsForSolution = async (userId) => {
  try {
    const points = calculatePoints('SUBMIT_SOLUTION');
    const result = await updateUserPoints(userId, points, 'SOLVED_PROBLEMS', 1);
    
    // Check for Problem Solver badge
    await checkAndAwardBadges(userId, 'SOLVED_PROBLEMS', 1);
    
    return result;
  } catch (error) {
    console.error('Error awarding points for solution:', error);
    throw error;
  }
};

// Get user's gamification status
const getUserGamificationStatus = async (userId) => {
  try {
    const user = await User.findById(userId).select('points badges languages');
    if (!user) {
      throw new Error('User not found');
    }

    // Get badge details
    const badgeDetails = user.badges.map(badgeId => BADGES[badgeId]).filter(Boolean);

    return {
      points: user.points,
      badges: badgeDetails,
      languages: user.languages || []
    };
  } catch (error) {
    console.error('Error getting user gamification status:', error);
    throw error;
  }
};

// Track unique languages for Language Explorer badge
const trackLanguageUsage = async (userId, language) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If user doesn't have a languages array, create it
    if (!user.languages) {
      user.languages = [];
    }

    // Add language if it's not already tracked
    if (!user.languages.includes(language)) {
      user.languages.push(language);
      await user.save();

      // Check for Language Explorer badge
      await checkAndAwardBadges(userId, 'UNIQUE_LANGUAGES', user.languages.length);
      
      return { message: 'Language tracked successfully' };
    }

    return { message: 'Language already tracked' };
  } catch (error) {
    console.error('Error tracking language usage:', error);
    throw error;
  }
};

module.exports = {
  awardPointsForJoiningRoom,
  awardPointsForChatMessage,
  awardPointsForSolution,
  getUserGamificationStatus,
  trackLanguageUsage,
  checkAndAwardBadges,
  getLeaderboard,
  getBadgeDetails
}; 