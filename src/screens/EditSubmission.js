import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditSubmission({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to edit submissions');
      return;
    }

    try {
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/submissions/${id}/`,
        {
          method: 'PUT',
          headers: {
            'Api-Key': user.apiKey,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            submission_id: id,
            title,
            content
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update submission');
      
      navigate(`/submission/${id}`);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to update submission');
    }
  };

  if (!user) return <div>Please log in to edit submissions</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <center>
      <table border="0" cellPadding="0" cellSpacing="0" width="85%" bgcolor="#f6f6ef">
        <tbody>
          <tr>
            <td>
              <h2>Edit Submission</h2>
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Title: </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Content: </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <button type="submit">Save changes</button>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </center>
  );
}

export default EditSubmission; 