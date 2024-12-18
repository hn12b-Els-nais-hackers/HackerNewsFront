import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente recursivo para renderizar un comentario y sus respuestas
const Comment = ({ comment, level = 0, onReply, user, onAction }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [editText, setEditText] = useState(comment.text);

    // Asegurarnos de que el autor sea un string
    const authorName = typeof comment.author === 'object' ? comment.author.username : comment.author;

    const handleAction = (action) => {
        if (!user) return;
        onAction(comment.id, action);
    };

    const handleEdit = async () => {
        try {
            const response = await fetch(
                `https://hackernews-jwl9.onrender.com/api/comments/${comment.id}/`,
                {
                    method: 'PUT',
                    headers: {
                        'Api-Key': user.apiKey,
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        text: editText,
                        submission_id: comment.submission_id
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to edit comment');

            const updatedComment = await response.json();
            onAction(comment.id, 'edit', updatedComment);
            setIsEditing(false);
        } catch (err) {
            console.error('Error editing comment:', err);
        }
    };

    return (
        <div className="comment" style={{ marginLeft: `${level * 40}px` }}>
            <div className="comment-content">
                <div className="comment-meta">
                    <span className="comhead">
                        <Link to={`/user/${authorName}`} className="hnuser">
                            {authorName}
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

                {isEditing ? (
                    <div className="edit-form">
                        <textarea
                            rows="4"
                            style={{ width: '100%' }}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                        />
                        <button onClick={handleEdit}>update</button>
                        <button onClick={() => {
                            setIsEditing(false);
                            setEditText(comment.text);
                        }}>
                            cancel
                        </button>
                    </div>
                ) : (
                    <span className="commtext">
                        {comment.text}
                    </span>
                )}

                {user && (
                    <table className="comment-actions">
                        <tbody>
                            <tr>
                                <td className="subtext">
                                    {comment.voted ? (
                                        <span 
                                            className="action-link"
                                            onClick={() => handleAction('unvote')}
                                        >
                                            unvote
                                        </span>
                                    ) : (
                                        <span 
                                            className="action-link"
                                            onClick={() => handleAction('vote')}
                                        >
                                            vote
                                        </span>
                                    )}
                                    {' | '}
                                    {comment.favorited ? (
                                        <span 
                                            className="action-link"
                                            onClick={() => handleAction('unfav')}
                                        >
                                            unfav
                                        </span>
                                    ) : (
                                        <span 
                                            className="action-link"
                                            onClick={() => handleAction('fav')}
                                        >
                                            fav
                                        </span>
                                    )}
                                    {' | '}
                                    {comment.hidden ? (
                                        <span 
                                            className="action-link"
                                            onClick={() => handleAction('unhide')}
                                        >
                                            unhide
                                        </span>
                                    ) : (
                                        <span 
                                            className="action-link"
                                            onClick={() => handleAction('hide')}
                                        >
                                            hide
                                        </span>
                                    )}
                                    {' | '}
                                    <span 
                                        className="action-link"
                                        onClick={() => setIsReplying(!isReplying)}
                                    >
                                        reply
                                    </span>
                                    {user.username === authorName && (
                                        <>
                                            {' | '}
                                            <span 
                                                className="action-link"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                edit
                                            </span>
                                            {' | '}
                                            <span 
                                                className="action-link"
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this comment?')) {
                                                        handleAction('delete');
                                                    }
                                                }}
                                            >
                                                delete
                                            </span>
                                        </>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}

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

                {comment.replies?.map(reply => (
                    <Comment 
                        key={reply.id} 
                        comment={reply} 
                        level={level + 1}
                        onReply={onReply}
                        user={user}
                        onAction={onAction}
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

    const handleCommentAction = async (commentId, action, updatedData = null) => {
        if (!user) {
            setError('Please log in to perform this action');
            return;
        }

        try {
            let method = 'POST';
            let url;
            let body = null;

            if (action === 'delete') {
                method = 'DELETE';
                url = `https://hackernews-jwl9.onrender.com/api/comments/${commentId}/`;
            } else if (action === 'edit') {
                method = 'PUT';
                url = `https://hackernews-jwl9.onrender.com/api/comments/${commentId}/`;
                body = JSON.stringify({
                    text: updatedData.text || updatedData,
                    submission_id: updatedData.submission_id
                });
            } else {
                url = `https://hackernews-jwl9.onrender.com/api/comments/${commentId}/?action=${action}`;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Api-Key': user.apiKey,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                ...(body && { body })
            });

            if (!response.ok) throw new Error(`Failed to ${action} comment`);

            if (action === 'delete') {
                // Eliminar el comentario del estado
                setComments(prevComments => {
                    const removeComment = (comments) => {
                        return comments.filter(comment => {
                            if (comment.id === commentId) {
                                return false;
                            }
                            if (comment.replies) {
                                comment.replies = removeComment(comment.replies);
                            }
                            return true;
                        });
                    };
                    return removeComment(prevComments);
                });
            } else {
                const updatedComment = await response.json();
                setComments(prevComments => {
                    const updateComment = (comments) => {
                        return comments.map(comment => {
                            if (comment.id === commentId) {
                                return {
                                    ...comment,
                                    ...updatedComment,
                                    replies: comment.replies // Mantener las respuestas existentes
                                };
                            }
                            if (comment.replies) {
                                return {
                                    ...comment,
                                    replies: updateComment(comment.replies)
                                };
                            }
                            return comment;
                        });
                    };
                    return updateComment(prevComments);
                });
            }
        } catch (err) {
            console.error('Error performing action:', err);
            setError('Failed to perform action');
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
                                            user={user}
                                            onAction={handleCommentAction}
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