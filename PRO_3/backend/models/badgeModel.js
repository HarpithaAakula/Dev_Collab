const mongoose = require('mongoose');

const badgeSchema = mongoose.Schema(
  {
    badgeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['collaboration', 'communication', 'achievement', 'exploration', 'milestone'],
      default: 'achievement'
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    requirement: {
      type: {
        type: String,
        enum: ['JOIN_ROOM', 'CHAT_MESSAGE', 'TOTAL_POINTS', 'UNIQUE_LANGUAGES', 'SOLVED_PROBLEMS'],
        required: true
      },
      count: {
        type: Number,
        required: true,
        min: 1
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '#4F46E5' // Default badge color
    }
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
badgeSchema.index({ badgeId: 1 });
badgeSchema.index({ category: 1 });
badgeSchema.index({ rarity: 1 });

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;