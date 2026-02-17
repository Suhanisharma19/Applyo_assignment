const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: {
    type: [
      {
        text: {
          type: String,
          required: [true, 'Option text is required'],
          trim: true,
          maxlength: [100, 'Option text cannot exceed 100 characters']
        },
        votes: {
          type: Number,
          default: 0,
          min: [0, 'Votes cannot be negative']
        }
      }
    ],
    required: [true, 'Options are required'],
    validate: {
      validator: function(options) {
        return options.length >= 2;
      },
      message: 'Poll must have at least 2 options'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
pollSchema.index({ createdAt: -1 });

// Method to get total votes
pollSchema.virtual('totalVotes').get(function() {
  return this.options.reduce((total, option) => total + option.votes, 0);
});

// Ensure virtual fields are serialized
pollSchema.set('toJSON', { virtuals: true });
pollSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Poll', pollSchema);