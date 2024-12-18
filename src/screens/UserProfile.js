import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import "../App.css";

const UserProfile = ({ apiKey }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch user profile data
      const profileResponse = await fetch(
        `https://hackernews-jwl9.onrender.com/api/profile/${username}/`,
        {
          headers: {
            "Api-Key": apiKey,
            Accept: "application/json",
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error(`Error fetching profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      setProfile(profileData);

      // Fetch posts and comments separately
      const postsResponse = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${username}/content/?content_type=submissions`,
        {
          headers: {
            "Api-Key": apiKey,
            Accept: "application/json",
          },
        }
      );

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.submissions || []);
      }

      const commentsResponse = await fetch(
        `https://hackernews-jwl9.onrender.com/api/user/${username}/content/?content_type=comments`,
        {
          headers: {
            "Api-Key": apiKey,
            Accept: "application/json",
          },
        }
      );

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username, apiKey]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="user-profile-container">
      <center>
        <div style={{ padding: "20px", backgroundColor: "#f6f6ef", width: "85%" }}>
          <h2>{profile.user.username}'s Profile</h2>

          <div className="user-info" style={{ margin: "20px 0" }}>
            <img
              src={profile.avatar}
              alt="User avatar"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
            />
            <img
              src={profile.banner}
              alt="User banner"
              style={{ width: "300px", height: "100px", marginTop: "10px" }}
            />
            <p style={{ marginTop: "10px" }}>{profile.about || "No description provided."}</p>
            <p>Karma: {profile.karma}</p>
          </div>

          <h3>Submissions</h3>
          {posts.length > 0 ? (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>
                  <a href={`/submission/${post.id}`}>{post.title}</a> - {post.points} points -{" "}
                  {new Date(post.created_at).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>This user has not made any submissions yet.</p>
          )}

          <h3>Comments</h3>
          {comments.length > 0 ? (
            <ul>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <a href={`/submission/${comment.parent_id}/comments`}>{comment.text}</a> -{" "}
                  {comment.points} points - {new Date(comment.created_at).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>This user has not made any comments yet.</p>
          )}
        </div>
      </center>
    </div>
  );
};

export default UserProfile;
