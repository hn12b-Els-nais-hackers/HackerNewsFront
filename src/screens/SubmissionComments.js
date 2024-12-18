import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
                
                // Extraemos la información de la submission del primer comentario o usamos los datos básicos
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
                setComments(data);

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
            setComments(prev => [...prev, newCommentData]);
            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment');
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
                                        <tr key={comment.id}>
                                            <td>
                                                <div className="comment">
                                                    <div className="comment-content">
                                                        {/* Meta información */}
                                                        <div className="comment-meta">
                                                            <span className="comhead">
                                                                <Link to={`/user/${comment.author}`} className="hnuser">
                                                                    {comment.author}
                                                                </Link>
                                                                <span className="age" title={comment.created_at}>
                                                                    {' '}
                                                                    {formatDate(comment.created_at)}
                                                                </span>
                                                                {' | '}
                                                                <Link to={`/submission/${comment.submission_id}`} className="age">
                                                                    parent
                                                                </Link>
                                                            </span>
                                                        </div>

                                                        {/* Texto del comentario */}
                                                        <span className="commtext">
                                                            {comment.text}
                                                        </span>

                                                        {/* Acciones del comentario */}
                                                        <table className="comment-actions">
                                                            <tbody>
                                                                <tr>
                                                                    <td className="subtext">
                                                                        {user && (
                                                                            <>
                                                                                <span className="action-link">vote</span>
                                                                                {' | '}
                                                                                <span className="action-link">fav</span>
                                                                                {' | '}
                                                                                <span className="action-link">hide</span>
                                                                            </>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>

                                                        {/* Botones de editar y eliminar */}
                                                        {user && comment.author === user.username && (
                                                            <div className="comment-actions">
                                                                <span className="action-link">edit</span>
                                                                {' | '}
                                                                <span 
                                                                    className="action-link"
                                                                    onClick={() => {
                                                                        if (window.confirm('Are you sure you want to delete this comment?')) {
                                                                            // handleDeleteComment(comment.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    delete
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Enlace de reply */}
                                                        {user && (
                                                            <div className="reply-link">
                                                                <span className="action-link">reply</span>
                                                            </div>
                                                        )}

                                                        {/* Formularios de edición y respuesta (inicialmente ocultos) */}
                                                        <div className="edit-form" style={{ display: 'none' }}>
                                                            <textarea defaultValue={comment.text} rows="4" style={{ width: '100%' }} />
                                                            <button type="submit">update</button>
                                                            <button type="button">cancel</button>
                                                        </div>

                                                        <div className="reply-form" style={{ display: 'none' }}>
                                                            <textarea rows="4" style={{ width: '100%' }} />
                                                            <button type="submit">add reply</button>
                                                        </div>
                                                    </div>

                                                    {/* Aquí irían las respuestas anidadas cuando implementemos esa funcionalidad */}
                                                </div>
                                            </td>
                                        </tr>
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