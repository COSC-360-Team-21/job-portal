import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MyApplications.css';

const STATUS_UI = {
  pending: {
    label: 'Pending',
    className: 'pending',
  },
  reviewed: {
    label: 'Reviewing',
    className: 'reviewing',
  },
  shortlisted: {
    label: 'Interview',
    className: 'interview',
  },
  rejected: {
    label: 'Rejected',
    className: 'rejected',
  },
};

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSalary(job) {
  if (!job) return '';
  if (job.salaryRange) return job.salaryRange;

  const min = job.salaryMin;
  const max = job.salaryMax;

  if (min && max) {
    return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
  }

  if (min) return `From $${Number(min).toLocaleString()}`;
  if (max) return `Up to $${Number(max).toLocaleString()}`;
  return '';
}

function BriefcaseIcon() {
  return (
    <svg
      className="myapps-job-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 7V5.8C9 4.806 9.806 4 10.8 4h2.4C14.194 4 15 4.806 15 5.8V7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.2 7h13.6C20.015 7 21 7.985 21 9.2v8.6C21 19.015 20.015 20 18.8 20H5.2C3.985 20 3 19.015 3 17.8V9.2C3 7.985 3.985 7 5.2 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 12.5h18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 15h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MyApplications() {
  const { token, authLoading } = useAuth();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [withdrawingId, setWithdrawingId] = useState('');

  const loadPage = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setPageError('');
      setActionError('');
      setSuccessMessage('');

      const [statsRes, appsRes] = await Promise.all([
        fetch('/api/applications/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch('/api/applications/mine?limit=50', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const statsJson = await statsRes.json();
      const appsJson = await appsRes.json();

      if (!statsRes.ok) {
        throw new Error(statsJson.message || 'Failed to load application stats.');
      }

      if (!appsRes.ok) {
        throw new Error(appsJson.message || 'Failed to load applications.');
      }

      setStats({
        total: statsJson.total || 0,
        pending: statsJson.pending || 0,
        reviewed: statsJson.reviewed || 0,
        shortlisted: statsJson.shortlisted || 0,
        rejected: statsJson.rejected || 0,
      });

      setApplications(Array.isArray(appsJson.data) ? appsJson.data : []);
    } catch (error) {
      setPageError(error.message || 'Something went wrong while loading this page.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      loadPage();
    }
  }, [authLoading, loadPage]);

  const sortedApplications = applications;

  const handleWithdraw = async (applicationId) => {
    const confirmed = window.confirm('Are you sure you want to withdraw this application?');
    if (!confirmed) return;

    try {
      setWithdrawingId(applicationId);
      setActionError('');
      setSuccessMessage('');

      const res = await fetch(`/api/applications/mine/${applicationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to withdraw application.');
      }

      setApplications((prev) => prev.filter((app) => app._id !== applicationId));
      setStats((prev) => ({
        total: Math.max(0, prev.total - 1),
        pending: json.removedStatus === 'pending' ? Math.max(0, prev.pending - 1) : prev.pending,
        reviewed: json.removedStatus === 'reviewed' ? Math.max(0, prev.reviewed - 1) : prev.reviewed,
        shortlisted:
          json.removedStatus === 'shortlisted'
            ? Math.max(0, prev.shortlisted - 1)
            : prev.shortlisted,
        rejected:
          json.removedStatus === 'rejected' ? Math.max(0, prev.rejected - 1) : prev.rejected,
      }));
      setSuccessMessage('Application withdrawn successfully.');
    } catch (error) {
      setActionError(error.message || 'Could not withdraw application.');
    } finally {
      setWithdrawingId('');
    }
  };

  if (authLoading || loading) {
    return (
      <section className="myapps-page">
        <div className="myapps-shell">
          <h1 className="myapps-title">My Applications</h1>
          <p className="myapps-subtitle">Track and manage your job applications</p>
          <div className="myapps-loading">Loading applications...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="myapps-page">
      <div className="myapps-shell">
        <div className="myapps-header">
          <h1 className="myapps-title">My Applications</h1>
          <p className="myapps-subtitle">Track and manage your job applications</p>
        </div>

        {pageError ? <div className="myapps-alert myapps-alert-error">{pageError}</div> : null}
        {actionError ? <div className="myapps-alert myapps-alert-error">{actionError}</div> : null}
        {successMessage ? (
          <div className="myapps-alert myapps-alert-success">{successMessage}</div>
        ) : null}

        <div className="myapps-stats-grid">
          <div className="myapps-stat-card">
            <p className="myapps-stat-label">Total Applications</p>
            <h3 className="myapps-stat-value">{stats.total}</h3>
          </div>

          <div className="myapps-stat-card">
            <p className="myapps-stat-label">Under Review</p>
            <h3 className="myapps-stat-value myapps-stat-value-review">{stats.reviewed}</h3>
          </div>

          <div className="myapps-stat-card">
            <p className="myapps-stat-label">Interviews</p>
            <h3 className="myapps-stat-value myapps-stat-value-interview">{stats.shortlisted}</h3>
          </div>

          <div className="myapps-stat-card">
            <p className="myapps-stat-label">Rejected</p>
            <h3 className="myapps-stat-value myapps-stat-value-rejected">{stats.rejected}</h3>
          </div>
        </div>

        {sortedApplications.length === 0 ? (
          <div className="myapps-empty-card">
            <p>You have not applied to any jobs yet.</p>
            <Link to="/jobs" className="myapps-browse-link">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="myapps-list">
            {sortedApplications.map((application) => {
              const job = application.job || {};
              const statusKey = application.applicationStatus || 'pending';
              const statusUi = STATUS_UI[statusKey] || STATUS_UI.pending;
              const salaryText = formatSalary(job);

              return (
                <article className="myapps-card" key={application._id}>
                  <div className="myapps-card-top">
                    <div className="myapps-card-left">
                      <div className="myapps-job-icon">
                        <BriefcaseIcon />
                      </div>

                      <div className="myapps-card-content">
                        <h2 className="myapps-job-title">{job.title || 'Untitled Job'}</h2>
                        <p className="myapps-company-name">{job.company || 'Unknown Company'}</p>

                        <div className="myapps-meta-row">
                          {job.location ? (
                            <span className="myapps-meta-item">
                              <span className="myapps-meta-icon">📍</span>
                              {job.location}
                            </span>
                          ) : null}

                          {salaryText ? (
                            <span className="myapps-meta-item">
                              <span className="myapps-meta-icon">$</span>
                              {salaryText}
                            </span>
                          ) : null}

                          <span className="myapps-meta-item">
                            <span className="myapps-meta-icon">🗓</span>
                            Applied {formatDate(application.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="myapps-withdraw-btn"
                      onClick={() => handleWithdraw(application._id)}
                      disabled={withdrawingId === application._id}
                    >
                      {withdrawingId === application._id ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  </div>

                  <div className={`myapps-status-bar myapps-status-bar-${statusUi.className}`}>
                    {statusUi.label}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}