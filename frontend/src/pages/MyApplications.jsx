import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MyApplications.css';

const STATUS_LABELS = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const MyApplications = () => {
  const { token, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        setApplications(json.data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  if (!token || !user) {
    return (
      <section className="ma-page">
        <h1 className="ma-title">My Applications</h1>
        <p className="ma-empty">
          Please <Link to="/login">log in</Link> to view your applications.
        </p>
      </section>
    );
  }

  return (
    <section className="ma-page">
      <div className="ma-header">
        <h1 className="ma-title">My Applications</h1>
        <p className="ma-subtitle">
          {loading
            ? 'Loading…'
            : `${applications.length} application${applications.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {loading && (
        <div className="ma-loading">
          <span className="ma-spinner" aria-hidden="true" />
          <span>Loading applications…</span>
        </div>
      )}

      {error && !loading && (
        <div className="ma-error" role="alert">
          Could not load applications — {error}
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <p className="ma-empty">
          You haven&apos;t submitted any applications yet.{' '}
          <Link to="/jobs">Browse jobs</Link> to get started.
        </p>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="ma-list">
          {applications.map((app) => (
            <div key={app._id} className="ma-card">
              <div className="ma-card-header">
                <h3 className="ma-card-title">{app.job?.title ?? 'Unknown Job'}</h3>
                <span className={`ma-status ma-status--${app.applicationStatus}`}>
                  {STATUS_LABELS[app.applicationStatus] ?? app.applicationStatus}
                </span>
              </div>
              <div className="ma-card-meta">
                {app.job?.company && <span>{app.job.company}</span>}
                {app.job?.location && <span>{app.job.location}</span>}
                {app.job?.workType && (
                  <span className="ma-badge">{app.job.workType}</span>
                )}
              </div>
              <p className="ma-card-date">Applied {formatDate(app.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyApplications;
