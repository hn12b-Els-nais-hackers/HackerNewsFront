import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Profile({ user }) {
  const [about, setAbout] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://hackernews-jwl9.onrender.com/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/${user.username}/`, {
          method: 'GET',
          headers: {
            'Api-Key': user.apiKey,
            'accept': 'application/json'
          }
        });
        console.log('Response status:', response.status); // For debugging
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        console.log('Profile data:', data); // For debugging
        setProfileData(data);
        setAbout(data.about || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      }
    };

    fetchProfile();
  }, [user.username, user.apiKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (avatar) formData.append('avatar', avatar);
      if (banner) formData.append('banner', banner);
      formData.append('about', about);

      const response = await fetch(`${API_BASE_URL}/profile/${user.username}/`, {
        method: 'POST',
        headers: {
          'Api-Key': user.apiKey,
          'accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Clear file inputs after successful update
      setBanner(null);
      setAvatar(null);
      
      // Optional: Show success message
      alert('Profile updated successfully');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="profile-header" 
        style={{ 
          backgroundImage: profileData?.banner ? `url(${profileData.banner})` : 'none'
        }}
      >
        <div 
          className="profile-avatar"
          style={{
            backgroundImage: profileData?.avatar ? `url(${profileData.avatar})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>

      <div className="profile-content">
        <div className="profile-info">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label>API Key: </label>
              <span>{user.apiKey}</span>
            </div>
            <br />

            <div>
              <label>Karma: </label>
              <span>{profileData?.karma || 0}</span>
            </div>
            <br />

            <div>
              <label>Banner:</label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setBanner(e.target.files[0])}
              />
              {profileData?.banner && (
                <div className="current-image">
                  Current banner: <a href={profileData.banner} target="_blank" rel="noopener noreferrer">View</a>
                </div>
              )}
            </div>
            <br />

            <div>
              <label>Avatar:</label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
              {profileData?.avatar && (
                <div className="current-image">
                  Current avatar: <a href={profileData.avatar} target="_blank" rel="noopener noreferrer">View</a>
                </div>
              )}
            </div>
            <br />

            <div>
              <label>User: </label>
              <span>{user.username}</span>
            </div>
            <br />

            <div>
              <label>About:</label><br />
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="profile-textarea"
              />
            </div>
            <br />

            <button 
              type="submit"
              className="update-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </form>

          <div className="profile-links">
            <Link to="/user-submissions">Submissions</Link>{'|  '}
            <Link to="/user-comments">Comments</Link>{'|  '}
            <Link to="/hidden">Hidden</Link>{'|  '}
            <Link to="/upvoted">Upvoted Submissions / Comments</Link>{'|  '}
            <Link to="/favorites">Favorite Submissions / Comments</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 