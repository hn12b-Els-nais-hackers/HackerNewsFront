import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function SearchResults({ user }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (query) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `https://hackernews-jwl9.onrender.com/api/submissions/search/?Title%20of%20the%20Submission=${encodeURIComponent(query)}`,
            {
              headers: {
                'Api-Key': user.apiKey,
                'accept': 'application/json'
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const data = await response.json();
          setSubmissions(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [query, user.apiKey]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="search-results">
      <h2>Search results for "{query}"</h2>
      {submissions.length > 0 ? (
        submissions.map((submission) => (
          <div className="submission" key={submission.id}>
            <div className="title">
              {submission.url ? (
                <a href={submission.url}>{submission.title}</a>
              ) : (
                <a href={`/comments/${submission.id}`}>{submission.title}</a>
              )}
            </div>
            <div className="subtext">
              {submission.points} points by:  
              <a href={`/profile/${submission.user}`}> {submission.user}</a> 
              {' '}{new Date(submission.created_at).toLocaleString()} {' '} 
              | <a href={`/comments/${submission.id}`}>comments</a>
            </div>
          </div>
        ))
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}

export default SearchResults;
