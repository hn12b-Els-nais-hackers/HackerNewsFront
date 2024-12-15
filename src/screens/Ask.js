import React, { useState, useEffect, useCallback} from 'react';
import { Link } from 'react-router-dom';

function Ask({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [userUpvotedSubmissions, setUserUpvotedSubmissions] = useState(new Set());
  const [order, setOrder] = useState('points');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserUpvotedSubmissions =  useCallback(async () => {
    try {
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=upvoted`,
        {
          headers: {
            'Api-Key': user.apiKey,
            'accept': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch user upvoted submissions');

      const data = await response.json();

      // Access the submissions array from the response
      if (data.submissions && Array.isArray(data.submissions)) {
        setUserUpvotedSubmissions(new Set(data.submissions.map(sub => sub.id))); // Assuming each submission has an 'id'
      } else {
        console.error('Unexpected data format:', data);
        setError('Failed to load upvoted submissions. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching user upvoted submissions:', err);
      setError('Failed to load upvoted submissions. Please try again.');
    }
  }, [user.username, user.apiKey]);

  const handleSubmissionAction = async (submissionId, action) => {
    try {
      //const submission = submissions.find(s => s.id === submissionId);
      const hasVoted = userUpvotedSubmissions.has(submissionId);

      if (action === 'vote' && hasVoted) {
        // Prevent upvoting the same submission twice
        return;
      }

      let response;

      if (action === 'delete') {
        // Handle deletion of the submission
        response = await fetch(
          `https://hackernews-jwl9.onrender.com/api/submissions/${submissionId}/`,
          {
            method: 'DELETE',
            headers: {
              'accept': '*/*',
              'Api-Key': user.apiKey
            }
          }
        );

        if (!response.ok) throw new Error('Failed to delete submission');

        // Remove the deleted submission from the state
        setSubmissions(submissions.filter(sub => sub.id !== submissionId));
        return; // Exit the function after deletion
      } else {
        // Handle voting actions
        response = await fetch(
          `https://hackernews-jwl9.onrender.com/api/submissions/${submissionId}/?action=${action}`,
          {
            method: 'POST',
            headers: {
              'Api-Key': user.apiKey,
              'accept': 'application/json'
            }
          }
        );

        if (!response.ok) throw new Error(`Failed to ${action} submission`);
      }
      if (action === 'vote') setUserUpvotedSubmissions(prev => new Set(prev).add(submissionId));
      if (action === 'unvote') setUserUpvotedSubmissions(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
      // Update the submissions list after successful action
      setSubmissions(submissions.map(submission => {
        if (submission.id === submissionId) {
          return {
            ...submission,
            points: action === 'vote' ? submission.points + 1 : 
                    action === 'unvote' ? submission.points - 1 : 
                    submission.points,
            voters: action === 'vote' ? 
                    [...(submission.voters || []), user.username] :
                    action === 'unvote' ? 
                    (submission.voters || []).filter(voter => voter !== user.username) :
                    submission.voters
          };
        }
        return submission;
      }));

      // Update user upvoted submissions
      if (action === 'vote') {
        setUserUpvotedSubmissions(prev => new Set(prev).add(submissionId));
      } else if (action === 'unvote') {
        setUserUpvotedSubmissions(prev => {
          const newSet = new Set(prev);
          newSet.delete(submissionId);
          return newSet;
        });
      }

    } catch (err) {
      console.error(`Error ${action} submission:`, err);
      setError(`Failed to ${action} submission. Please try again.`);
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          `https://hackernews-jwl9.onrender.com/api/submissions/?type=ask&order=${order}`,
          {
            headers: {
              'Api-Key': user.apiKey,
              'accept': 'application/json'
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch submissions');
        const data = await response.json();
        setSubmissions(data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserUpvotedSubmissions(); // Fetch user upvoted submissions
    fetchSubmissions();
  }, [user.apiKey, order, fetchUserUpvotedSubmissions]);

  return (
    <div className="ask-container">
      <div className="order-controls">
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="points">Points</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {isLoading && <div>Loading...</div>}

      <table className="submissions-table">
        <tbody>
          {submissions.map((submission, index) => (
            <React.Fragment key={submission.id}>
              <tr className="athing">
                <td className="title-cell">
                  <span className="rank">{index + 1}.</span>
                </td>
                <td className="vote-cell">
                  {!userUpvotedSubmissions.has(submission.id) && submission.user !== user.username && (
                    <div 
                      className="votearrow" 
                      title="upvote"
                      onClick={() => handleSubmissionAction(submission.id, 'vote')}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </td>
                <td className="title">
                  <Link to={`/item/${submission.id}`}>{submission.title}</Link>
                </td>
              </tr>
              <tr>
                <td colSpan="2"></td>
                <td className="subtext">
                  <span>{submission.points} points</span>
                  {' by '}
                  <Link to={`/user/${submission.user}`}>{submission.user}</Link>
                  {' '}
                  <span>{new Date(submission.created_at).toLocaleString()}</span>
                  {' | '}
                  {userUpvotedSubmissions.has(submission.id) && (
                    <>
                      <span 
                        className="action-link"
                        onClick={() => handleSubmissionAction(submission.id, 'unvote')}
                      >
                        unvote
                      </span>
                      {' | '}
                    </>
                  )}
                  <span 
                    className="action-link"
                    onClick={() => handleSubmissionAction(submission.id, 'hide')}
                  >
                    hide
                  </span>
                  {' | '}
                  <span 
                    className="action-link"
                    onClick={() => handleSubmissionAction(submission.id, 'favorite')}
                  >
                    favorite
                  </span>
                  {submission.user === user.username && (
                    <>
                      {' | '}
                      <span 
                        className="action-link"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this submission?')) {
                            handleSubmissionAction(submission.id, 'delete');
                          }
                        }}
                      >
                        delete
                      </span>
                    </>
                  )}
                  {' | '}
                  <Link to={`/item/${submission.id}`}>
                    {submission.comment_count || 0} comments
                  </Link>
                </td>
              </tr>
              <tr className="spacer">
                <td colSpan="3" style={{ height: '5px' }}></td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ask;
