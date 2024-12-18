import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente recursivo para renderizar un comentario y sus respuestas
const Comment = ({ comment, level = 0, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    return (
        <div className="comment" style={{ marginLeft: `${level * 40}px` }}>
            <div className="comment-content">
                <div className="comment-meta">
                    <span className="comhead">
                        <Link to={`/user/${comment.author}`} className="hnuser">
                            {comment.author}
                        </Link>
                        <span className="age" title={comment.created_at}>
                            {' '}
                            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true, locale: es })}
                        </span>
                        {' | '}
                        <Link to={`/submission/${comment.submission_id}`} className="age">
                            parent
                        </Link>
                    </span>
                </div>

                <span className="commtext">
                    {comment.text}
                </span>

                <div className="reply-link">
                    <span 
                        className="action-link"
                        onClick={() => setIsReplying(!isReplying)}
                    >
                        reply
                    </span>
                </div>

                {isReplying && (
                    <div className="reply-form">
                        <textarea
                            rows="4"
                            style={{ width: '100%' }}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                        />
                        <button 
                            onClick={() => {
                                onReply(comment.id, replyText);
                                setReplyText('');
                                setIsReplying(false);
                            }}
                        >
                            add reply
                        </button>
                        <button onClick={() => setIsReplying(false)}>
                            cancel
                        </button>
                    </div>
                )}

                {/* Renderizar respuestas recursivamente */}
                {comment.replies?.map(reply => (
                    <Comment 
                        key={reply.id} 
                        comment={reply} 
                        level={level + 1}
                        onReply={onReply}
                    />
                ))}
            </div>
        </div>
    );
};

function SubmissionComments({ user }) {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissionAndComments = async () => {
            try {
                const headers = {
                    'accept': 'application/json'
                };
                
                if (user?.apiKey) {
                    headers['Api-Key'] = user.apiKey;
                }

                const response = await fetch(
                    `https://hackernews-jwl9.onrender.com/api/submissions/${id}/comments/`,
                    {
                        headers: headers
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch submission and comments');
                const data = await response.json();
                
                // Extraemos la información de la submission
                const submissionInfo = {
                    id: id,
                    title: data[0]?.submission_title || '',
                    url: data[0]?.submission_url || '',
                    points: data[0]?.submission_points || 0,
                    user: data[0]?.submission_author || '',
                    created_at: data[0]?.submission_created_at || new Date().toISOString(),
                    comment_count: data.length
                };
                setSubmission(submissionInfo);

                // Construir el árbol de comentarios
                const commentMap = {};
                const rootComments = [];

                // Primero, mapear todos los comentarios por ID
                data.forEach(comment => {
                    commentMap[comment.id] = {
                        ...comment,
                        replies: []
                    };
                });

                // Luego, construir el árbol
                data.forEach(comment => {
                    if (comment.parent_id) {
                        // Si tiene padre, añadirlo a las respuestas del padre
                        const parent = commentMap[comment.parent_id];
                        if (parent) {
                            parent.replies.push(commentMap[comment.id]);
                        }
                    } else {
                        // Si no tiene padre, es un comentario raíz
                        rootComments.push(commentMap[comment.id]);
                    }
                });

                // Ordenar los comentarios raíz por fecha (más recientes primero)
                rootComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                // Ordenar recursivamente las respuestas de cada comentario
                const sortReplies = (comments) => {
                    comments.forEach(comment => {
                        if (comment.replies && comment.replies.length > 0) {
                            comment.replies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                            sortReplies(comment.replies);
                        }
                    });
                };

                sortReplies(rootComments);

                setComments(rootComments);

            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load submission and comments');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissionAndComments();
    }, [id, user?.apiKey]);

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

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Please log in to comment');
            return;
        }

        try {
            const response = await fetch(
                `https://hackernews-jwl9.onrender.com/api/submissions/${id}/comments/`,
                {
                    method: 'POST',
                    headers: {
                        'Api-Key': user.apiKey,
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    },
                    body: JSON.stringify({ text: newComment })
                }
            );

            if (!response.ok) throw new Error('Failed to add comment');

            const newCommentData = await response.json();
            // Asegurarnos de que el autor sea un string
            const formattedComment = {
                ...newCommentData,
                author: newCommentData.author.username || newCommentData.author
            };
            setComments(prev => [...prev, formattedComment]);
            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment');
        }
    };

    const handleReplySubmit = async (parentId, text) => {
        if (!user) {
            setError('Please log in to reply');
            return;
        }

        try {
            const response = await fetch(
                `https://hackernews-jwl9.onrender.com/api/submissions/${id}/comments/`,
                {
                    method: 'POST',
                    headers: {
                        'Api-Key': user.apiKey,
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        text: text,
                        parent_id: parentId
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to add reply');

            const newReply = await response.json();
            const formattedReply = {
                ...newReply,
                author: newReply.author.username || newReply.author
            };

            // Actualizar los comentarios de forma recursiva
            const updateCommentsRecursively = (comments) => {
                return comments.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), formattedReply]
                        };
                    }
                    if (comment.replies) {
                        return {
                            ...comment,
                            replies: updateCommentsRecursively(comment.replies)
                        };
                    }
                    return comment;
                });
            };

            setComments(prevComments => updateCommentsRecursively(prevComments));
        } catch (err) {
            console.error('Error adding reply:', err);
            setError('Failed to add reply');
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (isLoading) return <div>Loading...</div>;
    if (!submission) return <div>Submission not found</div>;

    return (
        <center>
            <table border="0" cellPadding="0" cellSpacing="0" width="85%" bgcolor="#f6f6ef">
                <tbody>
                    <tr>
                        <td>
                            <table border="0" cellPadding="0" cellSpacing="0">
                                <tbody>
                                    <tr className='athing' id={submission.id}>
                                        <td align="right" valign="top" className="title">
                                            <span className="rank">1.</span>
                                        </td>
                                        <td className="title">
                                            <span className="titleline">
                                                <a href={submission.url}>{submission.title}</a>
                                                {submission.url && (
                                                    <span className="sitebit comhead">({submission.url})</span>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2"></td>
                                        <td className="subtext">
                                            <span className="score">{submission.points} points</span>
                                            {' by '}
                                            <Link to={`/user/${submission.user}`} className="hnuser">
                                                {submission.user}
                                            </Link>
                                            <span className="age">
                                                {' '}
                                                {formatDate(submission.created_at)}
                                            </span>
                                            {' | '}
                                            <span className="action-link">fav</span>
                                            {' | '}
                                            <span>{submission.comment_count} comment{submission.comment_count !== 1 ? 's' : ''}</span>
                                            {' | '}
                                            <span className="action-link">vote</span>
                                            {' | '}
                                            <span className="action-link">hide</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {user && (
                                <form onSubmit={handleAddComment} className="comment-form">
                                    <textarea 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add your comment..."
                                    />
                                    <button type="submit">add comment</button>
                                </form>
                            )}

                            <table border="0" cellPadding="0" cellSpacing="0">
                                <tbody>
                                    {comments.map(comment => (
                                        <Comment 
                                            key={comment.id} 
                                            comment={comment} 
                                            onReply={handleReplySubmit}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </center>
    );
}

export default SubmissionComments; 