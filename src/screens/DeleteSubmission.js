import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

function DeleteSubmission({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to delete submissions');
      return;
    }

    try {
      const response = await fetch(
        `https://hackernews-jwl9.onrender.com/api/submissions/${id}/`,
        {
          method: 'DELETE',
          headers: {
            'Api-Key': user.apiKey,
            'accept': 'application/json'
          }
        }
      );

      if (response.status === 403) {
        setError('You can only delete your own submissions');
        return;
      }

      if (response.status === 404) {
        setError('Submission not found');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      const data = await response.json();
      console.log('Delete successful:', data.message);
      
      navigate('/newest');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete submission');
    }
  };

  if (!user) return <div>Please log in to delete submissions</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <center>
      <table border="0" cellPadding="0" cellSpacing="0" width="85%" bgcolor="#f6f6ef">
        <tbody>
          <tr>
            <td>
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete submission #{id}?</p>

              <form onSubmit={handleDelete}>
                <button type="submit">Yes</button>
                {' '}
                <Link to="/newest">Cancel</Link>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </center>
  );
}

export default DeleteSubmission; 