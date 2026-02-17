import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const PollPage = () => {
  const { id } = useParams();
  console.log('Poll ID from useParams:', id); // Debug log
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [fingerprint, setFingerprint] = useState('');

  // Generate and store fingerprint using UUID in localStorage
  useEffect(() => {
    const storedFingerprint = localStorage.getItem('poll_fingerprint');
    
    if (storedFingerprint) {
      setFingerprint(storedFingerprint);
    } else {
      // Generate a new UUID-based fingerprint
      const newFingerprint = uuidv4();
      localStorage.setItem('poll_fingerprint', newFingerprint);
      setFingerprint(newFingerprint);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const socket = io('http://localhost:3002', {
      transports: ['websocket', 'polling']
    });

    // Join the poll room
    socket.on('connect', () => {
      socket.emit('joinPoll', id);
    });

    // Listen for vote updates
    socket.on('voteUpdated', (data) => {
      setPoll(data.data?.poll || data.poll);
    });

    // Listen for join confirmation
    socket.on('joinedPoll', (data) => {
      console.log('Joined poll room:', data);
    });

    // Cleanup
    return () => {
      socket.off('voteUpdated');
      socket.off('joinedPoll');
      socket.off('connect');
      socket.disconnect();
    };
  }, [id]);

  // Fetch poll data
  useEffect(() => {
    console.log('useEffect triggered with id:', id); // Debug log
    if (!id) {
      console.log('No poll ID provided');
      setError('Invalid poll ID');
      setLoading(false);
      return;
    }
    
    const fetchPoll = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/polls/${id}`);
        const data = await response.json();

        if (data.success) {
          setPoll(data.data);
        } else {
          setError(data.message || 'Failed to load poll');
        }
      } catch (err) {
        console.error('Error fetching poll:', err);
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        
        // Check if it's a JSON parsing error
        if (err instanceof SyntaxError && err.message.includes('Unexpected token')) {
          setError('Invalid poll ID or poll not found');
        } else {
          setError('Network error. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id]);

  const handleVote = async (e) => {
    e.preventDefault();

    if (!selectedOption) {
      setError('Please select an option to vote');
      return;
    }

    if (!fingerprint) {
      setError('Unable to generate device fingerprint');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3002/api/polls/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionId: selectedOption,
          fingerprint: fingerprint,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setHasVoted(true);
        setPoll(data.data.poll);
        setSelectedOption('');
        setError('');
      } else {
        setError(data.message || 'Failed to submit vote');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error submitting vote:', err);
    }
  };

  if (loading) {
    return (
      <div className="poll-page-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="poll-page-wrapper">
        <div className="poll-container error-state">
          <div className="error-icon-container">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <a href="/" className="btn btn-primary">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8"></path>
            </svg>
            Create New Poll
          </a>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="poll-page-wrapper">
        <div className="poll-container error-state">
          <div className="error-icon-container">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="error-title">Poll Not Found</h2>
          <p className="error-message">The poll you're looking for doesn't exist or has been removed.</p>
          <a href="/" className="btn btn-primary">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8"></path>
            </svg>
            Create New Poll
          </a>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  const copyLinkToClipboard = () => {
    const pollUrl = `${window.location.origin}/poll/${id}`;
    navigator.clipboard.writeText(pollUrl)
      .then(() => {
        alert('Poll link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = pollUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Poll link copied to clipboard!');
      });
  };

  return (
    <div className="poll-page-wrapper">
      <div className="poll-container">
        {/* Poll Header */}
        <div className="poll-header">
          <div className="poll-header-badge">
            <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Active Poll</span>
          </div>
          <h1 className="poll-title">{poll.question}</h1>
          <div className="poll-stats-mini">
            <span className="stat-badge">📊 {totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
            <span className="stat-badge">🔗 {poll.options.length} option{poll.options.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Options */}
        <div className="options-grid">
          {poll.options.map((option, index) => {
            const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
            const isSelected = selectedOption === option._id;
            
            return (
              <div key={option._id} className={`option-card ${isSelected ? 'selected' : ''} ${hasVoted ? 'voted' : ''}`}>
                <div className="option-header">
                  <div className="option-number">{index + 1}</div>
                  <div className="option-text-container">
                    <span className="option-text">{option.text}</span>
                  </div>
                  <div className="option-stats">
                    <span className="votes-count">{option.votes}</span>
                    <span className="percentage">{percentage}%</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar ${hasVoted ? 'revealed' : ''}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                {/* Radio Button */}
                {!hasVoted && (
                  <label className="option-radio">
                    <input
                      type="radio"
                      name="selectedOption"
                      value={option._id}
                      checked={isSelected}
                      onChange={() => setSelectedOption(option._id)}
                    />
                    <span className="radio-checkmark"></span>
                    <span className="radio-label">Select</span>
                  </label>
                )}
                
                {/* Vote Confirmation */}
                {hasVoted && isSelected && (
                  <div className="vote-confirmation">
                    <svg className="confirm-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Your vote
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="poll-actions">
          {!hasVoted ? (
            <form onSubmit={handleVote} className="vote-form">
              <button
                type="submit"
                disabled={!selectedOption}
                className="btn btn-primary btn-vote"
              >
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Submit Vote
              </button>
            </form>
          ) : (
            <div className="success-message">
              <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Thanks for voting! 🎉</span>
            </div>
          )}

          <button 
            onClick={copyLinkToClipboard}
            className="btn btn-secondary btn-share"
          >
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Share Poll
          </button>
        </div>

        {/* Footer */}
        <div className="poll-footer">
          <a href="/" className="footer-link">
            <svg className="link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8"></path>
            </svg>
            Create New Poll
          </a>
        </div>
      </div>
    </div>
  );
};

export default PollPage;