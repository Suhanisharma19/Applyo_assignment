const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: [true, 'Poll ID is required']
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    trim: true
  },
  fingerprint: {
    type: String,
    required: [true, 'Fingerprint is required'],
    trim: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate votes
voteSchema.index({ pollId: 1, ipAddress: 1, fingerprint: 1 }, { unique: true });

// Index for faster queries by poll
voteSchema.index({ pollId: 1 });

// Index for time-based queries
voteSchema.index({ votedAt: -1 });

// Pre-save hook to validate that the poll exists
voteSchema.pre('save', async function() {
  try {
    const Poll = mongoose.model('Poll');
    const poll = await Poll.findById(this.pollId);
    
    if (!poll) {
      throw new Error('Poll not found');
    }
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('Vote', voteSchema);