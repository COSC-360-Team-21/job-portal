import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CommentHistory.css';

const CommentHistory = () => {
  const { token, user, authLoading } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchComments = async () => {
      try {
        const res = await fetch('/api/comments/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load comments');
        setComments(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [token]);

  if (!authLoading && (!token || !user)) return <Navigate to="/login" replace />;

  return (
    <section className="comment-history-page">
      <h1>My Comment History</h1>
      <p>All your comments and discussions across job postings.</p>

      {loading ? (
        <div className="ch-loading">Loading comments…</div>
      ) : error ? (
        <div className="ch-error">{error}</div>
      ) : comments.length === 0 ? (
        <div className="ch-empty">You haven&apos;t posted any comments yet.</div>
      ) : (
        <div className="ch-list">
          {comments.map((c) => (
            <div key={c._id} className="ch-card">
              <div className="ch-card-header">
                <div>
                  <Link to={`/jobs/${c.job?._id || c.job}`}>
                    {c.job?.title || 'Job Post'}
                  </Link>
                  {c.parentComment && <span className="ch-reply-badge">Reply</span>}
                </div>
                <span className="ch-card-date">
                  {new Date(c.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="ch-card-body">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentHistory;
