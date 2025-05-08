const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Problem'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    userName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;