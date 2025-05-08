const express = require('express');
const { 
  createProblem, 
  getProblems, 
  getProblemById, 
  addSolution,
  searchProblems 
} = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const { voteSolution, acceptSolution } = require('../controllers/problemController');


// Search endpoint - must be before the /:id route
router.get('/search', searchProblems);

router.route('/')
  .post(protect, upload.array('media', 5), createProblem)
  .get(getProblems);

router.route('/:id')
  .get(getProblemById);

router.route('/:id/solutions')
  .post(protect, upload.array('media', 5), addSolution);

router.post('/:problemId/solutions/:solutionId/vote', protect, voteSolution);
router.post('/:problemId/solutions/:solutionId/accept', protect, acceptSolution);

module.exports = router;