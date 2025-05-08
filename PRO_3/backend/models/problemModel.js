const mongoose = require('mongoose');

const solutionSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    votes: {
      type: Number,
      default: 0,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const problemSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: 'text',
    },
    description: {
      type: String,
      required: true,
      index: 'text',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    tags: {
      type: [String],
      default: [],
      index: 'text',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'solved', 'closed'],
      default: 'open',
    },
    solutions: [solutionSchema],
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;