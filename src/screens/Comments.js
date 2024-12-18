import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function Comments({ user }) {
    const [comments, setComments] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const headers = {
                    'accept': 'application/json'
                };
                
                if (user?.apiKey) {
                    headers['Api-Key'] = user.apiKey;
                }

                const response = await fetch(
                    'https://hackernews-jwl9.onrender.com/api/comments/',
                    {
                        headers: headers
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();

                // Ordenar comentarios por fecha (más nuevo primero)
                const sortedComments = data.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );

                setComments(sortedComments);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load comments');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [user?.apiKey]);

    const formatDate = (dateString) => {
        try {
            if (!dateString) return '';
            const date = parseISO(dateString);
            return formatDistanceToNow(date, { locale: es, addSuffix: false }) + ' ago';
        } catch (err) {
            console.error('Error formatting date:', err);
            return '';
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="comment-table">
            {comments.length === 0 ? (
                <div>No comments yet.</div>
            ) : (
                comments.map(comment => (
                    <div key={comment.id} className="comment">
                        <div className="comment-meta">
                            <Link to={`/user/${comment.author}`} className="hnuser">
                                {comment.author}
                            </Link>
                            <span className="age">
                                {' '}
                                {formatDate(comment.created_at)}
                            </span>
                            {' | '}
                            <Link to={`/submission/${comment.submission_id}`}>
                                parent
                            </Link>
                            {' | '}
                            <Link to={`/submission/${comment.id}`}>
                                context
                            </Link>
                            {' | on: '}
                            <Link to={`/submission/${comment.submission_id}`}>
                                {comment.submission_title}
                            </Link>
                        </div>
                        <div className="commtext">
                            {comment.text}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Comments; 

