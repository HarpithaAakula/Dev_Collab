const User = require('../models/userModel');
const Badge = require('../models/badgeModel');
const { POINTS_RULES, BADGES, checkBadgeEligibility, calculatePoints } = require('../config/gamificationConfig');

// Track daily actions to prevent point farming
const dailyActionTracker = new Map();

// Helper function to get user's daily action count
const getDailyActionCount = (userId, actionType) => {
  const today = new Date().toDateString();
  const key = `${userId}_${actionType}_${today}`;
  return dailyActionTracker.get(key) || 0;
};

// Helper function to increment daily action count
const incrementDailyActionCount = (userId, actionType) => {
  const today = new Date().toDateString();
  const key = `${userId}_${actionType}_${today}`;
  const currentCount = dailyActionTracker.get(key) || 0;
  dailyActionTracker.set(key, currentCount + 1);
  return currentCount + 1;
};

// Clean up old daily trackers (run this periodically)
const cleanupOldTrackers = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  for (const [key] of dailyActionTracker) {
    if (key.includes(yesterdayStr)) {
      dailyActionTracker.delete(key);
    }
  }
};

// Award points and check badges
const awardPointsAndBadges = async (userId, actionType, io = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate points based on action type and daily limits
    let pointsToAward = 0;
    
    if (actionType === 'CHAT_MESSAGE') {
      const dailyCount = getDailyActionCount(userId, actionType);
      const remainingPoints = Math.max(0, POINTS_RULES.CHAT_MESSAGE_DAILY_CAP - (dailyCount * POINTS_RULES.CHAT_MESSAGE));
      pointsToAward = Math.min(POINTS_RULES.CHAT_MESSAGE, remainingPoints);
      
      if (pointsToAward > 0) {
        incrementDailyActionCount(userId, actionType);
      }
    } else {
      pointsToAward = POINTS_RULES[actionType] || 0;
    }

    if (pointsToAward <= 0) {
      return { pointsAwarded: 0, newBadges: [] };
    }

    // Update user points
    user.gamification.points += pointsToAward;
    
    // Track action counts for badge eligibility
    if (!user.gamification.actionCounts) {
      user.gamification.actionCounts = {};
    }
    
    user.gamification.actionCounts[actionType] = (user.gamification.actionCounts[actionType] || 0) + 1;

    // Check for new badges
    const newBadges = [];
    
    // Check each badge requirement
    for (const [badgeId, badge] of Object.entries(BADGES)) {
      // Skip if user already has this badge or it's a future badge
      if (user.gamification.badges.includes(badgeId) || badge.isFuture) {
        continue;
      }

      let qualifies = false;

      switch (badge.requirement.type) {
        case 'JOIN_ROOM':
          qualifies = (user.gamification.actionCounts.JOIN_ROOM || 0) >= badge.requirement.count;
          break;
        case 'CHAT_MESSAGE':
          qualifies = (user.gamification.actionCounts.CHAT_MESSAGE || 0) >= badge.requirement.count;
          break;
        case 'TOTAL_POINTS':
          qualifies = user.gamification.points >= badge.requirement.count;
          break;
        case 'UNIQUE_LANGUAGES':
          const uniqueLanguages = user.gamification.uniqueLanguages || [];
          qualifies = uniqueLanguages.length >= badge.requirement.count;
          break;
        case 'SOLVED_PROBLEMS':
          qualifies = (user.gamification.actionCounts.SOLVED_PROBLEMS || 0) >= badge.requirement.count;
          break;
      }

      if (qualifies) {
        user.gamification.badges.push(badgeId);
        newBadges.push({
          id: badgeId,
          name: badge.name,
          description: badge.description,
          icon: badge.icon
        });
      }
    }

    await user.save();

    // Emit real-time updates if socket.io is available
    if (io && pointsToAward > 0) {
      io.to(`user_${userId}`).emit('gamification_update', {
        points: pointsToAward,
        totalPoints: user.gamification.points,
        newBadges: newBadges
      });

      // Send notification for new badges
      if (newBadges.length > 0) {
        io.to(`user_${userId}`).emit('notification', {
          type: 'badge_earned',
          message: `Congratulations! You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`,
          badges: newBadges
        });
      }
    }

    return {
      pointsAwarded: pointsToAward,
      totalPoints: user.gamification.points,
      newBadges: newBadges
    };

  } catch (error) {
    console.error('Error awarding points and badges:', error);
    throw error;
  }
};

// Track unique language usage
const trackLanguageUsage = async (userId, language) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.gamification.uniqueLanguages) {
      user.gamification.uniqueLanguages = [];
    }

    if (!user.gamification.uniqueLanguages.includes(language)) {
      user.gamification.uniqueLanguages.push(language);
      await user.save();
      
      // Check for language explorer badge
      await awardPointsAndBadges(userId, 'UNIQUE_LANGUAGES');
    }
  } catch (error) {
    console.error('Error tracking language usage:', error);
  }
};

// Get user's gamification status
const getUserGamificationStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get badge details
    const userBadges = user.gamification.badges.map(badgeId => {
      const badge = BADGES[badgeId];
      return badge ? {
        id: badgeId,
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      } : null;
    }).filter(Boolean);

    return {
      points: user.gamification.points || 0,
      badges: userBadges,
      rank: await getUserRank(userId),
      actionCounts: user.gamification.actionCounts || {},
      uniqueLanguages: user.gamification.uniqueLanguages || []
    };
  } catch (error) {
    console.error('Error getting user gamification status:', error);
    throw error;
  }
};

// Get leaderboard
const getLeaderboard = async (limit = 10, skip = 0) => {
  try {
    const users = await User.find({})
      .sort({ 'gamification.points': -1 })
      .limit(limit)
      .skip(skip)
      .select('name gamification.points gamification.badges');

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      name: user.name,
      points: user.gamification.points || 0,
      badges: user.gamification.badges?.length || 0
    }));

    const totalUsers = await User.countDocuments({});

    return {
      leaderboard,
      totalUsers,
      currentPage: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(totalUsers / limit)
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Get user's rank
const getUserRank = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const userPoints = user.gamification.points || 0;
    const higherRankedCount = await User.countDocuments({
      'gamification.points': { $gt: userPoints }
    });

    return higherRankedCount + 1;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

// Get all badge details
const getBadgeDetails = async () => {
  try {
    return Object.entries(BADGES)
      .filter(([_, badge]) => !badge.isFuture)
      .map(([id, badge]) => ({
        id,
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

// Clean up old trackers every day
setInterval(cleanupOldTrackers, 24 * 60 * 60 * 1000);

module.exports = {
  awardPointsAndBadges,
  trackLanguageUsage,
  getUserGamificationStatus,
  getLeaderboard,
  getUserRank,
  getBadgeDetails,
  getDailyActionCount,
  incrementDailyActionCount
};