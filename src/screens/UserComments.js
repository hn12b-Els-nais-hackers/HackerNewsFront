import React, { useState, useEffect, useCallback } from "react";
import "../App.css";

const UserComments = ({ user }) => {
  const [comments, setComments] = useState([]);
  const [votedComments, setVotedComments] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user comments
  const fetchUserComments = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch user's comments
      const commentsResponse = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=comments`,
        {
          headers: {
            "Api-Key": user.apiKey,
            Accept: "application/json",
          },
        }
      );

      if (!commentsResponse.ok) {
        throw new Error(`Error fetching comments: ${commentsResponse.status}`);
      }

      const commentsData = await commentsResponse.json();
      setComments(commentsData.comments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.username, user.apiKey]);

  // Fetch upvoted comments
  const fetchVotedComments = useCallback(async () => {
    try {
      const votedResponse = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=upvoted`,
        {
          headers: {
            "Api-Key": user.apiKey,
            Accept: "application/json",
          },
        }
      );

      if (!votedResponse.ok) {
        throw new Error(`Error fetching voted comments: ${votedResponse.status}`);
      }

      const votedData = await votedResponse.json();
      const votedCommentIds = new Set(votedData.comments.map((comment) => comment.id));
      setVotedComments(votedCommentIds);
    } catch (err) {
      setError(err.message);
    }
  }, [user.username, user.apiKey]);

  // Perform action on a comment
  const handleAction = async (id, action) => {
    if (action === "delete"){
        try {
            const response = await fetch(
              `https://hackernews-jwl9.onrender.com/api/comments/${id}/`,
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
      
            // Refetch comments and voted comments to update the state
            await fetchUserComments();
            await fetchVotedComments();
          } catch (err) {
            setError(err.message);
          } 
     return;   
    }
    try {
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/comments/${id}/?action=${action}`,
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

      // Refetch comments and voted comments to update the state
      await fetchUserComments();
      await fetchVotedComments();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUserComments();
    fetchVotedComments();
  }, [fetchUserComments, fetchVotedComments]);

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="user-comments-container">
      <center>
        <div style={{ width: "85%", backgroundColor: "#f6f6ef", padding: "10px" }}>
          <h2>{user.username}'s Comments</h2>
          {comments.length > 0 ? (
            <table className="user-comments-table">
              <tbody>
                {comments.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <tr className="athing" id={`comment_${comment.id}`}>
                      <td valign="top" className="title">
                        <span className="score">{comment.points} points</span>{" "}
                        <span className="age">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                        {!votedComments.has(comment.id) && (
                          <>
                            {" "}
                            |{" "}
                            <button className="unhide-btn" onClick={() => handleAction(comment.id, "vote")}>
                              ▲ vote
                            </button>
                          </>
                        )}
                        {votedComments.has(comment.id) && (
                          <>
                            {" "}
                            |{" "}
                            <button className="unhide-btn" onClick={() => handleAction(comment.id, "unvote")}>
                              unvote
                            </button>
                          </>
                        )}
                        {" "}
                        |{" "}
                        <button className="unhide-btn" onClick={() => handleAction(comment.id, "favorite")}>
                          fav
                        </button>
                        {" "}
                        |{" "}
                        <button className="unhide-btn" onClick={() => handleAction(comment.id, "delete")}>
                          delete
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="comment-text">
                        {comment.text}
                      </td>
                    </tr>
                    <tr>
                      <td className="subtext">
                        {comment.parent_id && (
                          <span>
                            Reply to comment #{comment.parent_id}{" "}
                            | <a href={`/submission/${comment.parent_id}`}>view parent</a>
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
            <p>No comments available.</p>
          )}
        </div>
      </center>
    </div>
  );
};

export default UserComments;
