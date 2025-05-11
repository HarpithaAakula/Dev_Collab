const POINTS_RULES = {
  JOIN_ROOM: 5,                    // Points for joining a collaboration room
  CHAT_MESSAGE: 1,                 // Points per chat message
  CHAT_MESSAGE_DAILY_CAP: 20,      // Maximum points from chat messages per day
  SUBMIT_SOLUTION: 50,             // Points for submitting a solution (future implementation)
};

const BADGES = {
  FIRST_COLLABORATOR: {
    id: 'first_collaborator',
    name: 'First Collaborator',
    description: 'Joined your first collaboration room',
    icon: '🤝',
    requirement: {
      type: 'JOIN_ROOM',
      count: 1
    }
  },
  CHATTY: {
    id: 'chatty',
    name: 'Chatty',
    description: 'Sent 50 messages in problem discussions',
    icon: '💬',
    requirement: {
      type: 'CHAT_MESSAGE',
      count: 50
    }
  },
  POINTS_100_CLUB: {
    id: 'points_100_club',
    name: '100 Points Club',
    description: 'Reached 100 total points',
    icon: '🏆',
    requirement: {
      type: 'TOTAL_POINTS',
      count: 100
    }
  },
  LANGUAGE_EXPLORER: {
    id: 'language_explorer',
    name: 'Language Explorer',
    description: 'Collaborated in rooms for 3 different programming languages',
    icon: '🌍',
    requirement: {
      type: 'UNIQUE_LANGUAGES',
      count: 3
    }
  },
  PROBLEM_SOLVER: {
    id: 'problem_solver',
    name: 'Problem Solver',
    description: 'Solved 5 problems',
    icon: '✅',
    requirement: {
      type: 'SOLVED_PROBLEMS',
      count: 5
    },
    isFuture: true // Mark as future implementation
  }
};

// Helper function to check if a user qualifies for a badge
const checkBadgeEligibility = (user, actionType, actionCount) => {
  const earnedBadges = [];
  
  Object.values(BADGES).forEach(badge => {
    // Skip future badges
    if (badge.isFuture) return;
    
    // Skip if user already has the badge
    if (user.badges.includes(badge.id)) return;
    
    // Check if user meets the requirement
    if (badge.requirement.type === actionType && actionCount >= badge.requirement.count) {
      earnedBadges.push(badge.id);
    }
  });
  
  return earnedBadges;
};

// Helper function to calculate points for an action
const calculatePoints = (actionType, currentPoints = 0) => {
  const points = POINTS_RULES[actionType] || 0;
  
  // Apply daily cap for chat messages
  if (actionType === 'CHAT_MESSAGE') {
    return Math.min(points, POINTS_RULES.CHAT_MESSAGE_DAILY_CAP - currentPoints);
  }
  
  return points;
};

module.exports = {
  POINTS_RULES,
  BADGES,
  checkBadgeEligibility,
  calculatePoints
}; 