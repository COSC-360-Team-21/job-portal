import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./JobDetail.css";

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [collapsedComments, setCollapsedComments] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments/job/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.data || []);
      }
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
    fetchComments();
  }, [id, fetchComments]);

  if (loading) {
    return (
      <div className="jd-status">
        <span className="jd-spinner" aria-hidden="true" />
        <span>Loading job…</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="jd-status jd-status--error" role="alert">
        <p>Could not load job — {error ?? "not found"}</p>
        <Link to="/jobs" className="jd-back-link">← Back to listings</Link>
      </div>
    );
  }

  return (
    <div className="jd-page">
      <div className="jd-container">
        <Link to="/jobs" className="jd-back-link">← Back to listings</Link>

        <div className="jd-card">
          <div className="jd-top">
            <div className="jd-logo" aria-hidden="true">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="jd-meta">
              <h1 className="jd-title">{job.title}</h1>
              <p className="jd-company">{job.company}</p>
              <div className="jd-tags">
                <span className="jd-tag">{job.location}</span>
                <span className="jd-tag jd-tag--type">{job.workType}</span>
                {job.salaryRange && <span className="jd-tag jd-tag--salary">{job.salaryRange}</span>}
              </div>
              {(job.postedAt || job.createdAt) && (
                <p className="jd-posted">Posted {formatDate(job.postedAt ?? job.createdAt)}</p>
              )}
            </div>
          </div>

          <div className="jd-section">
            <h2>About the role</h2>
            <p className="jd-description">{job.description}</p>
          </div>

          {job.requirements?.length > 0 && (
            <div className="jd-section">
              <h2>Requirements</h2>
              <ul className="jd-requirements">
                {job.requirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="jd-actions">
            <button
              className="jd-apply-btn"
              onClick={() =>
                navigate(`/apply?job=${encodeURIComponent(job.title)}&jobId=${job._id}`)
              }
            >
              Apply Now
            </button>

            <Link
              className="jd-company-btn"
              to={`/companies/${job.company
                .toLowerCase()
                .replace(/&/g, "and")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")}`}
            >
              View more jobs by {job.company}
            </Link>
</div>

          {/* Discussion Section */}
          <div className="jd-section jd-comments-section">
            <h2>Discussion ({comments.length})</h2>

            {token && user ? (
              <div className="jd-comment-form">
                <textarea
                  className="jd-comment-input"
                  placeholder="Share your thoughts about this job…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                />
                <button
                  className="jd-comment-submit"
                  disabled={!commentText.trim() || commentLoading}
                  onClick={async () => {
                    if (!commentText.trim()) return;
                    setCommentLoading(true);
                    try {
                      const res = await fetch('/api/comments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ content: commentText.trim(), jobId: id }),
                      });
                      if (res.ok) {
                        setCommentText('');
                        fetchComments();
                      }
                    } catch { /* ignore */ }
                    setCommentLoading(false);
                  }}
                >
                  {commentLoading ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            ) : (
              <p className="jd-comment-login">
                <Link to="/login">Log in</Link> to join the discussion.
              </p>
            )}

            <div className="jd-comments-list">
              {comments.length === 0 ? (
                <p className="jd-no-comments">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="jd-comment">
                    <div className="jd-comment-header">
                      <span className="jd-comment-avatar">
                        {comment.author?.profileImage ? (
                          <img src={comment.author.profileImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          (comment.author?.name?.[0] || '?').toUpperCase()
                        )}
                      </span>
                      <div>
                        <strong>{comment.author?.name || 'Anonymous'}</strong>
                        <span className="jd-comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      {comment.replies?.length > 0 && (
                        <button
                          className="jd-collapse-btn"
                          onClick={() => setCollapsedComments((prev) => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                        >
                          {collapsedComments[comment._id] ? `▸ Show ${comment.replies.length} replies` : `▾ Hide replies`}
                        </button>
                      )}
                    </div>
                    <p className="jd-comment-body">{comment.content}</p>

                    {token && (
                      <button className="jd-reply-btn" onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}>
                        Reply
                      </button>
                    )}

                    {replyTo === comment._id && (
                      <div className="jd-reply-form">
                        <textarea
                          className="jd-comment-input jd-reply-input"
                          placeholder="Write a reply…"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="jd-comment-submit"
                            disabled={!replyText.trim() || commentLoading}
                            onClick={async () => {
                              if (!replyText.trim()) return;
                              setCommentLoading(true);
                              try {
                                const res = await fetch('/api/comments', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ content: replyText.trim(), jobId: id, parentCommentId: comment._id }),
                                });
                                if (res.ok) {
                                  setReplyText('');
                                  setReplyTo(null);
                                  fetchComments();
                                }
                              } catch { /* ignore */ }
                              setCommentLoading(false);
                            }}
                          >
                            Post Reply
                          </button>
                          <button className="jd-cancel-btn" onClick={() => { setReplyTo(null); setReplyText(''); }}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* Collapsible replies */}
                    {comment.replies?.length > 0 && !collapsedComments[comment._id] && (
                      <div className="jd-replies">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="jd-comment jd-reply-card">
                            <div className="jd-comment-header">
                              <span className="jd-comment-avatar jd-comment-avatar--sm">
                                {(reply.author?.name?.[0] || '?').toUpperCase()}
                              </span>
                              <div>
                                <strong>{reply.author?.name || 'Anonymous'}</strong>
                                <span className="jd-comment-date">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <p className="jd-comment-body">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
