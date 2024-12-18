import React, { useState, useEffect, useCallback } from "react";
import "../App.css";

const Favorites = ({ user }) => {
  const [favoritesContent, setFavoritesContent] = useState({
    submissions: [],
    comments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch favorite submissions and comments
  const fetchFavoritesContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=favorites`,
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
      setFavoritesContent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.username, user.apiKey]);

  // Remove a favorite submission or comment
  const handleRemoveFavorite = async (id, type) => {
    try {
      const url =
        type === "submission"
          ? `https://hackernews-jwl9.onrender.com/api/submissions/${id}/?action=unfavorite`
          : `https://hackernews-jwl9.onrender.com/api/comments/${id}/?action=unfavorite`;

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

      // Reload the favorites content
      await fetchFavoritesContent();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchFavoritesContent();
  }, [fetchFavoritesContent]);

  if (loading) return <p>Loading favorite content...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="hidden-container">
      <h2>Favorite Submissions</h2>
      {favoritesContent.submissions.length > 0 ? (
        <table className="hidden-table">
          <tbody>
            {favoritesContent.submissions.map((submission, index) => (
              <React.Fragment key={submission.id}>
                <tr className="athing" id={submission.id}>
                  <td align="right" valign="top" className="title">
                    <span className="rank">{index + 1}.</span>
                  </td>
                  <td className="title">
                    <span className="titleline">
                      <a href={submission.url} rel="nofollow">
                        {submission.title}
                      </a>
                      {submission.domain && (
                        <span className="sitebit comhead">
                          (<span className="sitestr">{submission.domain}</span>)
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2"></td>
                  <td className="subtext">
                    <span className="score">{submission.points} points</span>{" "}
                    by{" "}
                    <a href="#" className="hnuser">
                      {submission.user.username}
                    </a>{" "}
                    <span className="age">{submission.created_at}</span> |{" "}
                    <button
                      className="unhide-btn"
                      onClick={() =>
                        handleRemoveFavorite(submission.id, "submission")
                      }
                    >
                      Remove Favorite
                    </button>{" "}
                    | {submission.comment_count} comments
                  </td>
                </tr>
                <tr className="spacer" style={{ height: "5px" }}></tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No favorite submissions available.</p>
      )}

      <h2>Favorite Comments</h2>
      {favoritesContent.comments.length > 0 ? (
        <ul>
          {favoritesContent.comments.map((comment) => (
            <li key={comment.id}>
              <a href={`#`}>{comment.text}</a> - by {comment.author.username} (
              {comment.created_at})
              <button
                className="unhide-btn"
                onClick={() => handleRemoveFavorite(comment.id, "comment")}
              >
                Remove Favorite
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No favorite comments available.</p>
      )}
    </div>
  );
};

export default Favorites;
