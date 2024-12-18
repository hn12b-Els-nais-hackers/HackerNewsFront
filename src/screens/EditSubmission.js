import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditSubmission({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [originalTitle, setOriginalTitle] = useState('');
    const [originalUrl, setOriginalUrl] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        text: '',
        type: 'url',
        points: 0,
        user: '',
        created_at: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const headers = {
                    'accept': 'application/json'
                };
                
                if (user?.apiKey) {
                    headers['Api-Key'] = user.apiKey;
                }

                const response = await fetch(
                    `https://hackernews-jwl9.onrender.com/api/submissions/`,
                    {
                        headers: headers
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch submission');
                const submissions = await response.json();
                
                console.log('Submissions received:', submissions);

                const submission = submissions.find(sub => sub.id === parseInt(id));
                
                if (submission) {
                    console.log('Found submission:', submission);

                    const submissionInfo = {
                        title: submission.title,
                        url: submission.url,
                        text: submission.text || '',
                        type: 'url',
                        points: submission.points || 0,
                        user: submission.user || '',
                        created_at: submission.created_at || new Date().toISOString()
                    };

                    console.log('Submission Info:', submissionInfo);

                    setOriginalTitle(submissionInfo.title);
                    setOriginalUrl(submissionInfo.url);
                    setFormData(submissionInfo);
                }
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load submission');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmission();
    }, [id, user?.apiKey]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Please log in to edit');
            return;
        }

        try {
            const submissionData = {
                title: originalTitle,
                url: originalUrl,
                text: formData.text,
                type: 'url'
            };

            const response = await fetch(
                `https://hackernews-jwl9.onrender.com/api/comments/${id}/`,
                {
                    method: 'PUT',
                    headers: {
                        'Api-Key': user.apiKey,
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    },
                    body: JSON.stringify(submissionData)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update submission');
            }

            const updatedResponse = await fetch(
                `https://hackernews-jwl9.onrender.com/api/submissions/`,
                {
                    headers: {
                        'Api-Key': user.apiKey,
                        'accept': 'application/json'
                    }
                }
            );

            if (updatedResponse.ok) {
                const submissions = await updatedResponse.json();
                const updatedSubmission = submissions.find(sub => sub.id === parseInt(id));
                if (updatedSubmission) {
                    console.log('Updated submission:', updatedSubmission);
                }
            }

            navigate(`/submission/${id}`);
        } catch (err) {
            console.error('Error updating submission:', err);
            setError(err.message || 'Failed to update submission');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (error) return <div className="error-message">{error}</div>;
    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="submit-container">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="url">URL:</label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="text">Text:</label>
                    <textarea
                        id="text"
                        name="text"
                        value={formData.text}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                <button type="submit" className="submit-btn">Update</button>
            </form>
        </div>
    );
}

export default EditSubmission; 