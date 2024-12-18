import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function New({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [userUpvotedSubmissions, setUserUpvotedSubmissions] = useState(new Set());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserUpvotedSubmissions = useCallback(async () => {
    if (user && user.username && user.apiKey) {
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
        if (data.submissions && Array.isArray(data.submissions)) {
          setUserUpvotedSubmissions(new Set(data.submissions.map(sub => sub.id)));
        }
      } catch (err) {
        console.error('Error fetching user upvoted submissions:', err);
      }
    }
  }, [user]);

  const handleSubmissionAction = async (submissionId, action) => {
    if (!user) {
      setError('Please log in to perform this action');
      return;
    }

    try {
      const hasVoted = userUpvotedSubmissions.has(submissionId);

      if (action === 'vote' && hasVoted) {
        return;
      }

      const response = await fetch(
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

      if (action === 'vote') {
        setUserUpvotedSubmissions(prev => new Set(prev).add(submissionId));
      } else if (action === 'unvote') {
        setUserUpvotedSubmissions(prev => {
          const newSet = new Set(prev);
          newSet.delete(submissionId);
          return newSet;
        });
      }

      setSubmissions(submissions.map(submission => {
        if (submission.id === submissionId) {
          return {
            ...submission,
            points: action === 'vote' ? submission.points + 1 : 
                    action === 'unvote' ? submission.points - 1 : 
                    submission.points
          };
        }
        return submission;
      }));

    } catch (err) {
      console.error(`Error ${action} submission:`, err);
      setError(`Failed to ${action} submission`);
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const headers = {
          'accept': 'application/json'
        };
        
        if (user?.apiKey) {
          headers['Api-Key'] = user.apiKey;
        }

        const response = await fetch(
          'https://hackernews-jwl9.onrender.com/api/submissions/?type=url&order=newest',
          {
            headers: headers
          }
        );

        if (!response.ok) throw new Error('Failed to fetch submissions');
        const data = await response.json();

        const submissionsWithComments = await Promise.all(
          data.map(async (submission) => {
            try {
              const commentsResponse = await fetch(
                `https://hackernews-jwl9.onrender.com/api/submissions/${submission.id}/comments/`,
                { headers }
              );
              if (commentsResponse.ok) {
                const comments = await commentsResponse.json();
                return {
                  ...submission,
                  comment_count: comments.length
                };
              }
              return submission;
            } catch (err) {
              console.error(`Error fetching comments for submission ${submission.id}:`, err);
              return submission;
            }
          })
        );

        setSubmissions(submissionsWithComments);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
    fetchUserUpvotedSubmissions();
  }, [fetchUserUpvotedSubmissions, user?.apiKey]);

  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  };

  if (error) return <div className="error-message">{error}</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <center>
      <table border="0" cellPadding="0" cellSpacing="0" width="85%" bgcolor="#f6f6ef">
        <tbody>
          <tr>
            <td>
              <table border="0" cellPadding="0" cellSpacing="0">
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan="3">No submissions available.</td>
                    </tr>
                  ) : (
                    submissions.map((submission, index) => (
                      <React.Fragment key={submission.id}>
                        <tr className="athing" id={submission.id}>
                          <td align="right" valign="top" className="title">
                            <span className="rank">{index + 1}.</span>
                          </td>
                          <td valign="top" className="votelinks">
                            <center>
                              {user && !userUpvotedSubmissions.has(submission.id) && submission.user !== user.username && (
                                <div 
                                  className="votearrow" 
                                  title="upvote"
                                  onClick={() => handleSubmissionAction(submission.id, 'vote')}
                                />
                              )}
                            </center>
                          </td>
                          <td className="title">
                            <span className="titleline">
                              <a href={submission.url} rel="nofollow">{submission.title}</a>
                              <span className="sitebit comhead">
                                (<span className="sitestr">{getDomain(submission.url)}</span>)
                              </span>
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="2"></td>
                          <td className="subtext">
                            <span className="score" id={`score_${submission.id}`}>
                              {submission.points} points
                            </span>
                            {' by '}
                            <Link to={`/user/${submission.user}`} className="hnuser">
                              {submission.user}
                            </Link>
                            <span className="age" title={new Date(submission.created_at).toLocaleString()}>
                              {' '}
                              {formatDistanceToNow(new Date(submission.created_at), { locale: es })} ago
                            </span>
                            {user && userUpvotedSubmissions.has(submission.id) && (
                              <>
                                {' | '}
                                <span 
                                  className="action-link"
                                  onClick={() => handleSubmissionAction(submission.id, 'unvote')}
                                >
                                  unvote
                                </span>
                              </>
                            )}
                            {' | '}
                            <Link to={`/submission/${submission.id}`}>
                              {submission.submission_comments?.length || submission.comment_count || 0} comment{(submission.submission_comments?.length || submission.comment_count || 0) !== 1 ? 's' : ''}
                            </Link>
                            {' | '}
                            <span 
                              className="action-link"
                              onClick={() => handleSubmissionAction(submission.id, 'hide')}
                            >
                              hide
                            </span>
                            {user && submission.user === user.username && (
                              <>
                                {' | '}
                                <Link to={`/edit/${submission.id}`}>edit</Link>
                                {' | '}
                                <Link to={`/delete/${submission.id}`}>delete</Link>
                              </>
                            )}
                          </td>
                        </tr>
                        <tr className="spacer" style={{ height: '5px' }}></tr>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </center>
  );
}

export default New; 