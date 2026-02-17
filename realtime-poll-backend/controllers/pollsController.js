const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

// Import Socket.IO instance
const { getIO } = require('../server');

// Create a new poll
const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    
    // Validate question is not empty
    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Question is required and cannot be empty'
      });
    }
    
    // Validate options array exists
    if (!options || !Array.isArray(options)) {
      return res.status(400).json({
        success: false,
        message: 'Options must be an array'
      });
    }
    
    // Validate at least 2 options
    if (options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Poll must have at least 2 options'
      });
    }
    
    // Validate each option is not empty
    for (let i = 0; i < options.length; i++) {
      if (!options[i] || options[i].trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Option ${i + 1} cannot be empty`
        });
      }
    }
    
    // Create poll with options initialized to 0 votes
    const poll = new Poll({
      question: question.trim(),
      options: options.map(option => ({ 
        text: option.trim(), 
        votes: 0 
      }))
    });
    
    await poll.save();
    
    // Return only the poll ID as requested
    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      pollId: poll._id
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all polls
const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: polls.length,
      data: polls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single poll by ID
const getPollById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: poll
    });
  } catch (error) {
    // Handle cast errors gracefully
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Vote on a poll by ID
const voteOnPollById = async (req, res) => {
  try {
    console.log('voteOnPollById called with params:', req.params);
    console.log('voteOnPollById called with body:', req.body);
    
    const { optionId, fingerprint } = req.body;
    
    // Validate input
    if (!optionId || !fingerprint) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: optionId, fingerprint'
      });
    }
    
    // Validate ObjectId format for poll ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    // Get user IP from request
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    console.log('IP Address:', ipAddress);
    
    // Find the poll
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    console.log('Found poll:', poll.question);
    console.log('Poll options:', poll.options);
    
    // Find the option by ID
    const optionIndex = poll.options.findIndex(option => option._id.toString() === optionId);
    console.log('Option index found:', optionIndex);
    
    if (optionIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Option not found'
      });
    }
    
    console.log('Checking for existing votes...');
    
    // Check if user has already voted (by IP) - Skip in development
    if (process.env.NODE_ENV !== 'development') {
      const existingIpVote = await Vote.findOne({ 
        pollId: req.params.id, 
        ipAddress: ipAddress 
      });
      console.log('Existing IP vote:', existingIpVote);
      
      if (existingIpVote) {
        return res.status(400).json({
          success: false,
          message: 'You have already voted on this poll from this IP address'
        });
      }
    }
    
    // Check if user has already voted (by fingerprint)
    const existingFingerprintVote = await Vote.findOne({ 
      pollId: req.params.id, 
      fingerprint: fingerprint 
    });
    console.log('Existing fingerprint vote:', existingFingerprintVote);
    
    if (existingFingerprintVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll with this device'
      });
    }
    
    console.log('Performing atomic update...');
    
    // Perform atomic update to increment vote count
    const updatedPoll = await Poll.findByIdAndUpdate(
      req.params.id,
      { $inc: { [`options.${optionIndex}.votes`]: 1 } },
      { returnDocument: 'after', runValidators: true }
    );
    
    console.log('Updated poll:', updatedPoll);
    
    // Create vote record
    const vote = new Vote({
      pollId: req.params.id,
      ipAddress,
      fingerprint
    });
    
    console.log('Saving vote record...');
    await vote.save();
    console.log('Vote record saved:', vote);
    
    // Emit voteUpdated event to the poll room with updated poll data
    // Skip Socket.IO in development to avoid circular dependency issues
    if (process.env.NODE_ENV !== 'development') {
      const io = getIO();
      if (io) {
        io.to(req.params.id).emit('voteUpdated', {
          poll: updatedPoll
        });
        console.log('Emitted voteUpdated event to room:', req.params.id);
      }
    } else {
      console.log('Skipping Socket.IO emit in development');
    }
    
    const responseData = {
      success: true,
      message: 'Vote recorded successfully',
      data: {
        poll: updatedPoll,
        vote: {
          _id: vote._id,
          pollId: vote.pollId,
          ipAddress: vote.ipAddress,
          fingerprint: vote.fingerprint,
          votedAt: vote.votedAt
        }
      }
    };
    
    console.log('Sending response:', responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    console.log('Error caught:', error);
    // Handle cast errors gracefully
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Vote on a poll (legacy route)
const voteOnPoll = async (req, res) => {
  try {
    const { pollId, optionIndex, ipAddress, fingerprint } = req.body;
    
    // Validate input
    if (!pollId || optionIndex === undefined || !ipAddress || !fingerprint) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pollId, optionIndex, ipAddress, fingerprint'
      });
    }
    
    // Find the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    // Check if option exists
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option index'
      });
    }
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ pollId, ipAddress, fingerprint });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }
    
    // Create vote record
    const vote = new Vote({
      pollId,
      ipAddress,
      fingerprint
    });
    
    // Update poll votes
    poll.options[optionIndex].votes += 1;
    
    // Save both documents
    await Promise.all([vote.save(), poll.save()]);
    
    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        poll: await Poll.findById(pollId),
        vote
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  voteOnPollById,
  voteOnPoll
};