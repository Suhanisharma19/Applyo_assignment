const Poll = require('../models/Poll');

console.log('Test controller loaded');

const getTest = (req, res) => {
  console.log('GET /api/test/ called');
  res.status(200).json({
    success: true,
    message: 'Realtime Poll Backend is running!',
    timestamp: new Date().toISOString()
  });
};

const createTestPoll = async (req, res) => {
  console.log('POST /api/test/create-test-poll called');
  try {
    const poll = new Poll({
      question: 'Test poll question?',
      options: [
        { text: 'Option 1', votes: 0 },
        { text: 'Option 2', votes: 0 }
      ]
    });
    
    await poll.save();
    
    res.status(201).json({
      success: true,
      message: 'Test poll created',
      data: poll
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getTest,
  createTestPoll
};