import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function Threads({ user }) {
    const [comments, setComments] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserComments = async () => {
            if (!user?.username || !user?.apiKey) {
                setError('Please log in to view your threads');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=comments`,
                    {
                        headers: {
                            'Api-Key': user.apiKey,
                            'accept': 'application/json'
                        }
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();
                setComments(data.comments || []);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load comments');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserComments();
    }, [user?.username, user?.apiKey]);

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
                comments.map((comment, index) => (
                    <div key={comment.id} className="comment" id={comment.id}>
                        <div className="comment-meta">
                            <span className="comhead">
                                {comment.points > 0 && (
                                    <>{comment.points} point{comment.points !== 1 ? 's' : ''} by{' '}</>
                                )}
                                <Link to={`/user/${comment.author}`} className="hnuser">
                                    {comment.author}
                                </Link>
                                <span className="age">
                                    {' '}
                                    {formatDate(comment.created_at)}
                                </span>
                                {' | '}
                                <Link to={`/submission/${comment.id}`}>
                                    parent
                                </Link>
                                {' | '}
                                <Link to={`/submission/${comment.id}`}>
                                    context
                                </Link>
                                {index < comments.length - 1 && (
                                    <>
                                        {' | '}
                                        <a href={`#${comments[index + 1].id}`}>next</a>
                                    </>
                                )}
                                {index > 0 && (
                                    <>
                                        {' | '}
                                        <a href={`#${comments[index - 1].id}`}>prev</a>
                                    </>
                                )}
                                {user && comment.author === user.username && (
                                    <>
                                        {' | '}
                                        <span className="action-link">edit</span>
                                        {' | '}
                                        <span className="action-link">delete</span>
                                    </>
                                )}
                               
                            </span>
                        </div>
                        <span className="commtext">
                            {comment.text}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
}

export default Threads; 
