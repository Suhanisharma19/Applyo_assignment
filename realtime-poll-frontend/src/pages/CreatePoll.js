import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

console.log('API_URL:', API_URL);

const CreatePoll = () => {
  const navigate = useNavigate();
  const questionInputRef = useRef(null);
  const optionInputRefs = useRef([]);
  
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    question: '',
    options: ['', '']
  });

  // Auto-focus question input on component mount
  useEffect(() => {
    if (questionInputRef.current && !shareLink) {
      questionInputRef.current.focus();
    }
  }, [shareLink]);

  // Validation functions
  const validateQuestion = (value) => {
    if (!value) {
      return 'Question is required';
    }
    if (value.length < 10) {
      return 'Question must be at least 10 characters';
    }
    return '';
  };

  const validateOption = (value, index) => {
    if (!value) {
      return `Option ${index + 1} is required`;
    }
    return '';
  };

  const validateForm = () => {
    const errors = {
      question: validateQuestion(question),
      options: options.map((option, index) => validateOption(option, index))
    };
    
    setFieldErrors(errors);
    
    // Check if form is valid
    const isQuestionValid = !errors.question;
    const areOptionsValid = errors.options.every(error => !error);
    const hasEnoughOptions = options.filter(opt => opt).length >= 2;
    
    return isQuestionValid && areOptionsValid && hasEnoughOptions;
  };

  // Handler functions
  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
      setFieldErrors(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
      
      const newErrors = [...fieldErrors.options];
      newErrors.splice(index, 1);
      setFieldErrors(prev => ({
        ...prev,
        options: newErrors
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    
    // Clear error for this option if it's being filled
    if (value !== '' && fieldErrors.options[index]) {
      const newErrors = [...fieldErrors.options];
      newErrors[index] = '';
      setFieldErrors(prev => ({
        ...prev,
        options: newErrors
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        question: question,
        options: options,
      };
      
      const res = await axios.post(`${API_URL}/api/polls`, data);
      const link = `${window.location.origin}/poll/${res.data.pollId}`;
      setShareLink(link);
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setFieldErrors({ question: '', options: ['', ''] });
      
      // Optional redirect after 2 seconds
      setRedirecting(true);
      setTimeout(() => {
        navigate(`/poll/${res.data.pollId}`);
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
      console.error('Error creating poll:', err);
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Success State Component
  const SuccessState = () => (
    <div className="success-section">
      <div className="success-icon-container">
        <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h2 className="success-title">Poll Created Successfully! 🎉</h2>
      <p className="success-subtitle">Your poll is ready to share with the world</p>
      
      {/* Share Link Section */}
      <div className="share-section">
        <div className="share-box">
          <div className="share-header">
            <h3 className="share-title">📤 Share this poll</h3>
            {copied && (
              <div className="copy-confirmation">
                <svg className="confirmation-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Link Copied!</span>
              </div>
            )}
          </div>
          
          <div className="share-content">
            <div className="share-link-container">
              <input 
                value={shareLink} 
                readOnly 
                className="share-input"
                title="Click to select all"
                onClick={(e) => e.target.select()}
              />
              <button 
                onClick={copyToClipboard}
                className={`btn btn-copy ${copied ? 'btn-copied' : ''}`}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
            
            <div className="share-actions">
              <button 
                onClick={() => window.open(shareLink, '_blank')}
                className="btn btn-open"
              >
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Open Poll
              </button>
              <button 
                onClick={() => {
                  const text = `Check out my poll: ${shareLink}`;
                  if (navigator.share) {
                    navigator.share({ title: 'Share Poll', text });
                  } else {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
                  }
                }}
                className="btn btn-share"
              >
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.469 9 12c0-3.315-2.686-6-6-6S-3 8.685-3 12s2.686 6 6 6c.469 0 .938-.114 1.342-.316m0 0a6 6 0 100-12m6 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Poll Stats */}
      <div className="poll-stats">
        <div className="stat-item">
          <div className="stat-icon">👥</div>
          <p className="stat-text">Ready to collect votes</p>
        </div>
        <div className="stat-item">
          <div className="stat-icon">⚡</div>
          <p className="stat-text">Real-time updates</p>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🔗</div>
          <p className="stat-text">Shareable link</p>
        </div>
      </div>
      
      {redirecting && (
        <div className="redirect-notice">
          <div className="redirect-spinner"></div>
          <p>Taking you to the poll in <span className="countdown">2</span>s...</p>
        </div>
      )}
      
      <div className="success-actions">
        <button 
          onClick={() => navigate(`/poll/${shareLink.split('/').pop()}`)}
          className="btn btn-primary btn-view-poll"
        >
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          View Poll
        </button>
        <button 
          onClick={() => {
            setShareLink('');
            setRedirecting(false);
            if (questionInputRef.current) {
              questionInputRef.current.focus();
            }
          }}
          className="btn btn-outline"
        >
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Another
        </button>
      </div>
    </div>
  );

  // Form Component
  const PollForm = () => (
    <form onSubmit={handleSubmit} className="poll-form">
      {/* General Error Message */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Question Section */}
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="question" className="form-label">
            Poll Question
          </label>
          <div className="input-wrapper">
            <div className="input-container">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <input
                ref={questionInputRef}
                type="text"
                id="question"
                value={question}
                maxLength={200}
                placeholder="What's your question?"
                onChange={(e) => setQuestion(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="char-counter">
              {question.length} / 200
            </div>
          </div>
          {fieldErrors.question && (
            <div className="error-message">
              <svg className="error-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {fieldErrors.question}
            </div>
          )}
        </div>
      </div>

      {/* Options Section */}
      <div className="form-section">
        <div className="form-group">
          <div className="section-header">
            <label className="form-label">
              Answer Options
            </label>
            <div className="section-meta">
              <span className="option-counter">
                {options.filter(opt => opt).length}/10 filled
              </span>
            </div>
          </div>

          {/* Options List */}
          <div className="options-container">
            {options.map((option, index) => (
              <div key={index} className="option-row">
                <div className="input-wrapper">
                  <div className="input-container">
                    <span className="option-number">{index + 1}</span>
                    <input
                      ref={(el) => {
                        if (el) optionInputRefs.current[index] = el;
                      }}
                      type="text"
                      value={option}
                      maxLength={100}
                      placeholder={`Option ${index + 1}`}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        // Tab to next option or add option if on last one
                        if (e.key === 'Tab' && !e.shiftKey && index === options.length - 1) {
                          e.preventDefault();
                          addOption();
                          setTimeout(() => {
                            optionInputRefs.current[index + 1]?.focus();
                          }, 0);
                        }
                        // Ctrl+Enter or Cmd+Enter to submit
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          document.querySelector('.btn-submit')?.click();
                        }
                      }}
                      className="form-input"
                    />
                  </div>
                  <div className="char-counter">
                    {option.length} / 100
                  </div>
                </div>
                {fieldErrors.options[index] && (
                  <div className="error-message">
                    <svg className="error-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {fieldErrors.options[index]}
                  </div>
                )}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="btn btn-secondary-remove"
                  >
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Add Option Button */}
          <div className="add-option-wrapper">
            <button
              type="button"
              onClick={addOption}
              disabled={options.length >= 10}
              className="btn btn-add-option"
            >
              + Add Option
            </button>
          </div>
          
          <div className="helper-text-container">
            <p className="helper-text">
              Add at least 2 options to continue
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="form-section">
        <button
          type="submit"
          disabled={loading || options.filter(opt => opt).length < 2}
          className={`btn btn-primary btn-submit ${loading ? 'btn-loading' : ''}`}
        >
          {loading ? (
            <>
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Poll...
            </>
          ) : options.filter(opt => opt).length < 2 ? (
            `Add ${2 - options.filter(opt => opt).length} more option(s)`
          ) : (
            <>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              Create Poll
            </>
          )}
        </button>
      </div>

      {/* Keyboard Shortcuts Hints */}
      {!shareLink && (
        <div className="keyboard-hints">
          <div className="keyboard-hint">
            <kbd>Tab</kbd>
            <span>on last option to add new</span>
          </div>
          <div className="keyboard-hint">
            <kbd>Ctrl</kbd>
            <span>+</span>
            <kbd>Enter</kbd>
            <span>to submit</span>
          </div>
        </div>
      )}
    </form>
  );

  // Main Component Render
  return (
    <div className="page-wrapper">
      <div className="main-container">
        <div className="card-header">
          <h1 className="page-title">Create New Poll</h1>
          <div className="title-divider"></div>
        </div>
        
        {shareLink ? <SuccessState /> : <PollForm />}
      </div>
    </div>
  );
};

export default CreatePoll;