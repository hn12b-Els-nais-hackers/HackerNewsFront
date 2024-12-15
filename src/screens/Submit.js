import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Submit({ user }) {
  const [title, setTitle] = useState('');
  const [submissionType, setSubmissionType] = useState('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://hackernews-jwl9.onrender.com/api/submissions/', {
        method: 'POST',
        headers: {
          'Api-Key': user.apiKey,
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          url: submissionType === 'url' ? url : undefined,
          text: submissionType === 'ask' ? text : undefined,
          submission_type: submissionType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create submission');
      }

      // Redirect to home page after successful submission
      navigate('/');
      
    } catch (err) {
      console.error('Error creating submission:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="submit-container">
      <h2>Submit a New Submission</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="submission_type">Submission Type:</label>
          <select
            id="submission_type"
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            required
          >
            <option value="url">URL</option>
            <option value="ask">Ask</option>
          </select>
        </div>

        {submissionType === 'url' && (
          <div className="form-group">
            <label htmlFor="url">URL:</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
        )}

        {submissionType === 'ask' && (
          <div className="form-group">
            <label htmlFor="text">Ask Question:</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="4"
              required
            />
          </div>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default Submit; 