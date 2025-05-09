
const Problem = require('../models/problemModel');
const { createNotification } = require('./notificationController');

// @desc    Create a new problem
// @route   POST /api/problems
// @access  Private
const createProblem = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    // Handle media files
    const media = {
      images: [],
      videos: []
    };

    if (req.files) {
      req.files.forEach(file => {
        if (file.mimetype.startsWith('image/')) {
          media.images.push(file.path);
        } else if (file.mimetype.startsWith('video/')) {
          media.videos.push(file.path);
        }
      });
    }
    
    const problem = await Problem.create({
      title,
      description,
      tags: tags.split(',').map(tag => tag.trim()),
      user: req.user._id,
      media
    });

    if (problem) {
      res.status(201).json(problem);
    } else {
      res.status(400).json({ message: 'Invalid problem data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
const getProblems = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    const count = await Problem.countDocuments();
    const problems = await Problem.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({ problems, page, pages: Math.ceil(count / pageSize), count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get problem by ID
// @route   GET /api/problems/:id
// @access  Public
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('user', 'name email')
      .populate('solutions.user', 'name email');
    
    if (problem) {
      // Increment view count
      problem.viewCount += 1;
      await problem.save();
      
      res.json(problem);
    } else {
      res.status(404).json({ message: 'Problem not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search problems
// @route   GET /api/problems/search
// @access  Public
const searchProblems = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const problems = await Problem.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('user', 'name');
    
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add solution to problem
// @route   POST /api/problems/:id/solutions
// @access  Private
const addSolution = async (req, res) => {
  try {
    const { content } = req.body;
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Handle media files for solution
    const media = {
      images: [],
      videos: []
    };

    if (req.files) {
      req.files.forEach(file => {
        if (file.mimetype.startsWith('image/')) {
          media.images.push(file.path);
        } else if (file.mimetype.startsWith('video/')) {
          media.videos.push(file.path);
        }
      });
    }
    
    const solution = {
      content,
      user: req.user._id,
      media
    };
    
    problem.solutions.push(solution);
    
    // If problem was open, mark as in-progress
    if (problem.status === 'open') {
      problem.status = 'in-progress';
    }
    
    await problem.save();
    
    // Create notification for problem owner
    await createNotification({
      recipient: problem.user,
      sender: req.user._id,
      problemId: problem._id,
      type: 'new_solution',
      message: `${req.user.name} submitted a solution to your problem: ${problem.title}`,
      relatedItemId: problem.solutions[problem.solutions.length - 1]._id
    });
    
    // Emit socket event for real-time notification (handled in server.js)
    req.io?.to(`user_${problem.user.toString()}`).emit('notification', {
      type: 'new_solution',
      message: `${req.user.name} submitted a solution to your problem: ${problem.title}`,
      problemId: problem._id,
      solutionId: problem.solutions[problem.solutions.length - 1]._id
    });
    
    const updatedProblem = await Problem.findById(req.params.id)
      .populate('user', 'name email')
      .populate('solutions.user', 'name email');
    
    res.status(201).json(updatedProblem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote or downvote a solution
// @route   POST /api/problems/:problemId/solutions/:solutionId/vote
// @access  Private
const voteSolution = async (req, res) => {
  const { voteType } = req.body; // 'upvote' or 'downvote'

  try {
    const problem = await Problem.findById(req.params.problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const solution = problem.solutions.id(req.params.solutionId);
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    if (voteType === 'upvote') {
      solution.votes += 1;
    } else if (voteType === 'downvote') {
      solution.votes -= 1;
    }

    await problem.save();
    
    // Notify solution creator of vote
    await createNotification({
      recipient: solution.user,
      sender: req.user._id,
      problemId: problem._id,
      type: 'solution_voted',
      message: `${req.user.name} ${voteType === 'upvote' ? 'upvoted' : 'downvoted'} your solution for problem: ${problem.title}`,
      relatedItemId: solution._id
    });
    
    // Real-time notification
    req.io?.to(`user_${solution.user.toString()}`).emit('notification', {
      type: 'solution_voted',
      message: `${req.user.name} ${voteType === 'upvote' ? 'upvoted' : 'downvoted'} your solution`,
      problemId: problem._id,
      solutionId: solution._id
    });
    
    res.status(200).json({ message: 'Vote recorded successfully', solution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a solution
// @route   POST /api/problems/:problemId/solutions/:solutionId/accept
// @access  Private
const acceptSolution = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const solution = problem.solutions.id(req.params.solutionId);
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    if (problem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to accept a solution for this problem' });
    }

    // Mark all other solutions as not accepted
    problem.solutions.forEach((sol) => (sol.isAccepted = false));
    solution.isAccepted = true;
    
    // Update problem status to 'solved'
    problem.status = 'solved';

    await problem.save();
    
    // Create notification for solution creator
    await createNotification({
      recipient: solution.user,
      sender: req.user._id,
      problemId: problem._id,
      type: 'solution_accepted',
      message: `Your solution for problem "${problem.title}" was accepted!`,
      relatedItemId: solution._id
    });
    
    // Real-time notification
    req.io?.to(`user_${solution.user.toString()}`).emit('notification', {
      type: 'solution_accepted',
      message: `Your solution for problem "${problem.title}" was accepted!`,
      problemId: problem._id,
      solutionId: solution._id
    });
    
    res.status(200).json({ message: 'Solution accepted successfully', solution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  searchProblems,
  addSolution,
  voteSolution,
  acceptSolution,
};