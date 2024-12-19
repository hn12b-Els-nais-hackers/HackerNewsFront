import React, { useState, useEffect, useCallback } from "react";
import { Link } from 'react-router-dom';
import "../App.css";

const UserSubmissions = ({ user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [upvotedSubmissions, setUpvotedSubmissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user submissions
  const fetchUserSubmissions = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch user's submissions
      const submissionsResponse = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=submissions`,
        {
          headers: {
            "Api-Key": user.apiKey,
            Accept: "application/json",
          },
        }
      );

      if (!submissionsResponse.ok) {
        throw new Error(`Error fetching submissions: ${submissionsResponse.status}`);
      }

      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData.submissions || []);

      // Fetch user's upvoted submissions
      const upvotedResponse = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=upvoted`,
        {
          headers: {
            "Api-Key": user.apiKey,
            Accept: "application/json",
          },
        }
      );

      if (!upvotedResponse.ok) {
        throw new Error(`Error fetching upvoted submissions: ${upvotedResponse.status}`);
      }

      const upvotedData = await upvotedResponse.json();
      const upvotedIds = new Set(upvotedData.submissions.map((submission) => submission.id));
      setUpvotedSubmissions(upvotedIds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.username, user.apiKey]);

  // Perform action on a submission
  const handleAction = async (id, action) => {
    if(action === "delete"){
      try {
        const response = await fetch(
          `https://hackernews-jwl9.onrender.com/api/submissions/${id}/`,
          {
            method: "DELETE",
            headers: {
              "Api-Key": user.apiKey,
              Accept: "application/json",
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
  
        // Refetch data to update state
        await fetchUserSubmissions();
      } catch (err) {
        setError(err.message);
      }
      return;
    }
    try {
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/submissions/${id}/?action=${action}`,
        {
          method: "POST",
          headers: {
            "Api-Key": user.apiKey,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Refetch data to update state
      await fetchUserSubmissions();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUserSubmissions();
  }, [fetchUserSubmissions]);

  if (loading) return <p>Loading submissions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="user-submissions-container">
      <center>
        <div style={{ width: "85%", backgroundColor: "#f6f6ef", padding: "10px" }}>
          <h2>{user.username}'s Submissions</h2>
          {submissions.length > 0 ? (
            <table className="user-submissions-table">
              <tbody>
                {submissions.map((submission, index) => (
                  <React.Fragment key={submission.id}>
                    <tr className="athing" id={`submission_${submission.id}`}>
                      <td align="right" valign="top" className="title">
                        <span className="rank">{index + 1}.</span>
                      </td>
                      <td valign="top" className="votelinks">
                        <center>
                          {!upvotedSubmissions.has(submission.id) && (
                            <button
                              onClick={() => handleAction(submission.id, "vote")}
                            >
                              ▲
                            </button>
                          )}
                        </center>
                      </td>
                      <td className="title">
                        <span className="titleline">
                          <a href={submission.url} rel="nofollow">
                            {submission.title}
                          </a>
                          {submission.domain && (
                            <span className="sitebit comhead">({submission.domain})</span>
                          )}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2"></td>
                      <td className="subtext">
                        <span className="score">{submission.points} points</span>{" "}
                        <span className="age">
                          {new Date(submission.created_at).toLocaleString()}
                        </span>
                        {upvotedSubmissions.has(submission.id) && (
                          <> | <button className="unhide-btn" onClick={() => handleAction(submission.id, "unvote")}>unvote</button></>
                        )}{" "}
                        |<button className="unhide-btn">
                          <Link to={`/submission/${submission.id}`}>
                            {submission.submission_comments?.length || submission.comment_count} comment{(submission.submission_comments?.length || submission.comment_count || 0) !== 1 ? 's' : ''}
                          </Link>  
                        </button> 
                        
                        | <button className="unhide-btn" onClick={() => handleAction(submission.id, "hide")}>hide</button>
                        {submission.is_hidden && (
                          <> | <button className="unhide-btn" onClick={() => handleAction(submission.id, "unhide")}>unhide</button></>
                        )}
                        {submission.user === user.username && (
                          <>
                            {" "}
                            | <button className="unhide-btn" onClick={() => handleAction(submission.id, "favorite")}>fav</button>{" "}
                            | <button className="unhide-btn" onClick={() => handleAction(submission.id, "delete")}>delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                    <tr className="spacer" style={{ height: "5px" }}></tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No submissions available.</p>
          )}
        </div>
      </center>
    </div>
  );
};

export default UserSubmissions;
