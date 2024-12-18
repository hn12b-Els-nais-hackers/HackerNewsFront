import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

function EditComment({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to edit comments');
      return;
    }

    try {
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/comments/${id}/`,
        {
          method: 'PUT',
          headers: {
            'Api-Key': user.apiKey,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            text
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update comment');
      
      navigate(`/submission/${id}`);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to update comment');
    }
  };

  if (!user) return <div>Please log in to edit comments</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <center>
      <table border="0" cellPadding="0" cellSpacing="0" width="85%" bgcolor="#f6f6ef">
        <tbody>
          <tr>
            <td>
              <h2>Edit Comment</h2>
              <form onSubmit={handleSubmit}>
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows="6"
                    cols="60"
                    required
                    placeholder="Enter your updated comment..."
                  />
                </div>
                <div style={{ marginTop: '10px' }}>
                  <button type="submit">Update</button>
                  {' '}
                  <Link to={`/comments`}>Cancel</Link>
                </div>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </center>
  );
}

export default EditComment; 