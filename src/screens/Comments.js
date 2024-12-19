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
                if (!user || !user.username) {
                    setError('Please log in to view comments');
                    return;
                }

                const headers = {
                    'accept': 'application/json'
                };
                
                if (user.apiKey) {
                    headers['Api-Key'] = user.apiKey;
                }

                // Obtener los comentarios
                const response = await fetch(
                    `https://hackernews-jwl9.onrender.com/api/user/${user.username}/content/?content_type=comments`,
                    {
                        headers: headers
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();
                const comments = data.comments || [];
                console.log('Comments:', comments);

                // Obtener todas las submissions
                const submissionsResponse = await fetch(
                    'https://hackernews-jwl9.onrender.com/api/submissions/',
                    {
                        headers: headers
                    }
                );

                if (!submissionsResponse.ok) throw new Error('Failed to fetch submissions');
                const submissions = await submissionsResponse.json();
                console.log('Submissions:', submissions);

                // Añadir el título de la submission a cada comentario
                const commentsWithSubmissions = comments.map(comment => {
                    console.log('Processing comment:', comment);
                    console.log('Looking for submission:', comment.submission);
                    const submission = submissions.find(sub => sub.id === parseInt(comment.submission));
                    console.log('Found submission:', submission);
                    return {
                        ...comment,
                        submission_id: comment.submission,
                        submission_title: submission ? submission.title : 'untitled'
                    };
                });

                const sortedComments = commentsWithSubmissions.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );

                console.log('Final comments:', sortedComments);
                setComments(sortedComments);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load comments');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [user]);

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

export default Comments; 

