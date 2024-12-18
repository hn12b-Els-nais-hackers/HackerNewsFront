import React, { useState, useEffect, useCallback } from "react";
import "../App.css";

const UpvotedContent = ({ user }) => {
  const [upvotedContent, setUpvotedContent] = useState({
    submissions: [],
    comments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpvotedContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=upvoted`,
        {
          headers: {
            "Api-Key": user.apiKey,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setUpvotedContent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.username, user.apiKey]);

  const handleDownvote = async (id, type) => {
    try {
      const url =
        type === "submission"
          ? `https://hackernews-jwl9.onrender.com/api/submissions/${id}/?action=unvote`
          : `https://hackernews-jwl9.onrender.com/api/comments/${id}/?action=unvote`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Api-Key": user.apiKey,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Reload the upvoted content after downvoting
      await fetchUpvotedContent();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUpvotedContent();
  }, [fetchUpvotedContent]);

  if (loading) return <p>Loading upvoted content...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="upvoted-container">
      <center>
        <div style={{ width: "85%", backgroundColor: "#f6f6ef", padding: "10px" }}>
          <h2>Upvoted Submissions</h2>
          {upvotedContent.submissions.length > 0 ? (
            <table className="upvoted-table">
              <tbody>
                {upvotedContent.submissions.map((submission, index) => (
                  <React.Fragment key={submission.id}>
                    <tr className="athing" id={`submission_${submission.id}`}>
                      <td valign="top" className="title">
                        <span className="score">{submission.points} points</span>{" "}
                        <span className="age">{new Date(submission.created_at).toLocaleString()}</span>
                        {" | "}
                        <button
                          className="unhide-btn"
                          onClick={() => handleDownvote(submission.id, "submission")}
                        >
                          Downvote
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="title">
                        <a href={submission.url} rel="nofollow">
                          {submission.title}
                        </a>{" "}
                        {submission.url && (
                          <span className="sitebit comhead">
                            ({new URL(submission.url).hostname})
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="spacer" style={{ height: "5px" }}></tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No upvoted submissions found.</p>
          )}

          <h2>Upvoted Comments</h2>
          {upvotedContent.comments.length > 0 ? (
            <table className="upvoted-table">
              <tbody>
                {upvotedContent.comments.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <tr className="athing" id={`comment_${comment.id}`}>
                      <td valign="top" className="title">
                        <span className="score">{comment.points} points</span>{" "}
                        <span className="age">{new Date(comment.created_at).toLocaleString()}</span>
                        {" | "}
                        <button
                          className="unhide-btn" 
                          onClick={() => handleDownvote(comment.id, "comment")}
                        >
                          Downvote
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="comment-text">{comment.text}</td>
                    </tr>
                    {comment.submission && (
                      <tr>
                        <td className="subtext">
                          <a href={comment.submission.url}>
                            on {comment.submission.title || "a submission"}
                          </a>
                        </td>
                      </tr>
                    )}
                    <tr className="spacer" style={{ height: "5px" }}></tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No upvoted comments found.</p>
          )}
        </div>
      </center>
    </div>
  );
};

export default UpvotedContent;
