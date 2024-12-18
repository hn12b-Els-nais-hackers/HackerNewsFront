import React, { useState, useEffect, useCallback } from 'react';
import '../App.css';

const Hidden = ({ user }) => {
  const [hiddenContent, setHiddenContent] = useState({ submissions: [], comments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHiddenContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=hidden`,
        {
          headers: {
            'Api-Key': user.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setHiddenContent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.username, user.apiKey]);;

  const handleUnhideSubmission = async (id, type) => {
    try {

    const url =
        type === "submission"
          ? `https://hackernews-jwl9.onrender.com/api/submissions/${id}/?action=unhide`
          : `https://hackernews-jwl9.onrender.com/api/comments/${id}/?action=unhide`;
          
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Api-Key': user.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Reload the hidden content after unhiding
      await fetchHiddenContent();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHiddenContent();
  }, [user]);

  if (loading) return <p>Loading hidden content...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="hidden-container">
      <h2>Hidden Submissions</h2>
      {hiddenContent.submissions.length > 0 ? (
        <table className="hidden-table">
          <tbody>
            {hiddenContent.submissions.map((submission, index) => (
              <React.Fragment key={submission.id}>
                <tr className="athing" id={submission.id}>
                  <td align="right" valign="top" className="title">
                    <span className="rank">{index + 1}.</span>
                  </td>
                  <td className="title">
                    <span className="titleline">
                      <a href={submission.url} rel="nofollow">{submission.title}</a>
                      {submission.domain && (
                        <span className="sitebit comhead"> (<span className="sitestr">{submission.domain}</span>)</span>
                      )}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2"></td>
                  <td className="subtext">
                    <span className="score">{submission.points} points</span>
                    {' '}by <a href="#" className="hnuser">{submission.user.username}</a>
                    {' '}<span className="age">{submission.created_at}</span>
                    {' '}| <button 
                            className="unhide-btn" 
                            onClick={() => handleUnhideSubmission(submission.id, 'submission')}>
                            unhide
                            </button>
                    {' '}| {submission.comment_count} comments
                  </td>
                </tr>
                <tr className="spacer" style={{ height: '5px' }}></tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hidden submissions available.</p>
      )}

      <h2>Hidden Comments</h2>
      {hiddenContent.comments.length > 0 ? (
        <ul>
          {hiddenContent.comments.map((comment) => (
            <li key={comment.id}>
              <a href={`#`}>{comment.text}</a> - by {comment.author.username} ({comment.created_at})
              <button className="unhide-btn" onClick={() => handleUnhideSubmission(comment.id, 'submission')}>unhide</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hidden comments available.</p>
      )}
    </div>
  );
};

export default Hidden;
