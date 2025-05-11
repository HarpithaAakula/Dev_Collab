const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
    },
    type: {
      type: String,
      required: true,
      enum: ['new_solution', 'new_message', 'solution_accepted', 'solution_voted', 'badge_earned'],
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      // This could reference a solution ID or message ID depending on notification type
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;