const express = require('express');
const {
  createPoll,
  getAllPolls,
  getPollById,
  voteOnPollById,
  voteOnPoll
} = require('../controllers/pollsController');

const router = express.Router();

// Create a new poll
router.post('/', createPoll);

// Vote on a poll by ID
router.post('/:id/vote', voteOnPollById);

// Get a single poll
router.get('/:id', getPollById);

// Get all polls
router.get('/', getAllPolls);

// Vote on a poll (legacy route)
router.post('/vote', voteOnPoll);

module.exports = router;