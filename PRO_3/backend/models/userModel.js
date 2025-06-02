const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Enhanced gamification schema
    gamification: {
      points: {
        type: Number,
        default: 0,
        min: 0
      },
      badges: [{
        type: String, // Badge IDs
        default: []
      }],
      // Track action counts for badge requirements
      actionCounts: {
        JOIN_ROOM: {
          type: Number,
          default: 0
        },
        CHAT_MESSAGE: {
          type: Number,
          default: 0
        },
        SOLVED_PROBLEMS: {
          type: Number,
          default: 0
        }
      },
      // Track unique programming languages used
      uniqueLanguages: [{
        type: String,
        default: []
      }],
      // Track achievements with timestamps
      achievements: [{
        badgeId: String,
        earnedAt: {
          type: Date,
          default: Date.now
        }
      }],
      // Statistics for dashboard
      stats: {
        totalRoomsJoined: {
          type: Number,
          default: 0
        },
        totalMessages: {
          type: Number,
          default: 0
        },
        totalProblemsAttempted: {
          type: Number,
          default: 0
        },
        totalProblemsSolved: {
          type: Number,
          default: 0
        },
        favoriteLanguage: {
          type: String,
          default: ''
        },
        joinedAt: {
          type: Date,
          default: Date.now
        },
        lastActive: {
          type: Date,
          default: Date.now
        }
      },
      // Level system (optional)
      level: {
        type: Number,
        default: 1
      },
      experience: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true,
  }
);

// Calculate level based on points (optional enhancement)
userSchema.methods.calculateLevel = function() {
  const points = this.gamification.points || 0;
  // Simple level calculation: every 100 points = 1 level
  const newLevel = Math.floor(points / 100) + 1;
  this.gamification.level = newLevel;
  return newLevel;
};

// Get user's progress towards next level
userSchema.methods.getLevelProgress = function() {
  const points = this.gamification.points || 0;
  const currentLevelPoints = (this.gamification.level - 1) * 100;
  const nextLevelPoints = this.gamification.level * 100;
  const progressPoints = points - currentLevelPoints;
  const requiredPoints = nextLevelPoints - currentLevelPoints;
  
  return {
    currentLevel: this.gamification.level,
    progressPoints,
    requiredPoints,
    percentage: Math.round((progressPoints / requiredPoints) * 100)
  };
};

// Get user's badge collection summary
userSchema.methods.getBadgeSummary = function() {
  const badges = this.gamification.badges || [];
  const achievements = this.gamification.achievements || [];
  
  return {
    totalBadges: badges.length,
    recentBadges: achievements
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 5),
    badgeIds: badges
  };
};

// Update user activity
userSchema.methods.updateActivity = function() {
  this.gamification.stats.lastActive = new Date();
  return this.save();
};

// Password matching method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Pre-save middleware to calculate level
userSchema.pre('save', function(next) {
  if (this.isModified('gamification.points')) {
    this.calculateLevel();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;