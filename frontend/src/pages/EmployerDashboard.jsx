import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EmployerDashboard.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const StatusBadge = ({ status }) => {
  const cls = {
    pending: 'ed-status-badge--pending',
    reviewed: 'ed-status-badge--reviewed',
    shortlisted: 'ed-status-badge--shortlisted',
    rejected: 'ed-status-badge--rejected',
  }[status] ?? 'ed-status-badge--pending';

  const label = {
    pending: 'Pending',
    reviewed: 'Reviewing',
    shortlisted: 'Accepted',
    rejected: 'Rejected',
  }[status] ?? status;

  return <span className={`ed-status-badge ${cls}`}>{label}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

/* ── Post Job modal ── */
const WORK_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

function PostJobModal({ token, user, onClose, onPosted }) {
  const [form, setForm] = useState({
    title: '',
    company: user?.profile?.companyName ?? user?.name ?? '',
    location: user?.profile?.companyLocation ?? '',
    description: '',
    requirements: '',
    salaryRange: '',
    workType: 'Full-time',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const body = {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        workType: form.workType,
      };
      if (form.salaryRange.trim()) body.salaryRange = form.salaryRange.trim();
      if (form.requirements.trim()) {
        body.requirements = form.requirements
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean);
      }

      const res = await fetch(`/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to post job');
      onPosted(data);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ed-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ed-modal">
        <div className="ed-modal-header">
          <div>
            <h2>Post a New Job</h2>
            <p>Fill in the details below to publish your listing.</p>
          </div>
          <button className="ed-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="ed-form-grid">
            <label>
              Job Title *
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior Developer"
                required
              />
            </label>
            <label>
              Company *
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Company name"
                required
              />
            </label>
            <label>
              Location *
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Vancouver, BC"
                required
              />
            </label>
            <label>
              Work Type *
              <select name="workType" value={form.workType} onChange={handleChange} required>
                {WORK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Salary Range
              <input
                name="salaryRange"
                value={form.salaryRange}
                onChange={handleChange}
                placeholder="e.g. $80,000 – $100,000"
              />
            </label>
            <label className="ed-form-span" style={{ gridColumn: '1 / -1' }}>
              Description *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the role, responsibilities, and team…"
                required
              />
            </label>
            <label className="ed-form-span" style={{ gridColumn: '1 / -1' }}>
              Requirements (one per line)
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="3+ years of React experience&#10;Strong communication skills"
              />
            </label>
          </div>
          {msg && (
            <div className={`ed-save-msg ed-save-msg--${msg.type}`}>{msg.text}</div>
          )}
          <div className="ed-modal-actions">
            <button type="button" className="ed-btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="ed-btn-primary" disabled={saving}>
              {saving ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

PostJobModal.propTypes = {
  token: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
    profile: PropTypes.shape({
      companyName: PropTypes.string,
      companyLocation: PropTypes.string,
    }),
  }),
  onClose: PropTypes.func.isRequired,
  onPosted: PropTypes.func.isRequired,
};

/* ── Main component ── */
export default function EmployerDashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [showPostJob, setShowPostJob] = useState(false);

  const companyName =
    user?.profile?.companyName || user?.name || 'Your Company';
  const avatarLetter = companyName.charAt(0).toUpperCase();

  const fetchDashboard = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch(`/api/jobs/employer-dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setLoadError(err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleJobPosted = (_newJob) => {
    setShowPostJob(false);
    fetchDashboard();
  };

  if (loadError) {
    return (
      <main className="ed-page">
        <p className="ed-error">{loadError}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="ed-page">
        <p className="ed-loading">Loading dashboard…</p>
      </main>
    );
  }

  const { stats, jobs, recentApplications } = data;
  const activeJobs = jobs.filter((j) => j.status === 'active');

  return (
    <main className="ed-page">
      {/* Header */}
      <header className="ed-header">
        <div className="ed-company-avatar" aria-hidden="true">
          {avatarLetter}
        </div>
        <div className="ed-header-copy">
          <h1>Employer Dashboard</h1>
          <p className="ed-company-name">{companyName}</p>
        </div>
        <div className="ed-header-actions">
          <Link className="ed-btn-outline" to="/profile">
            Edit Company Profile
          </Link>
          <button
            className="ed-btn-primary"
            onClick={() => setShowPostJob(true)}
          >
            + Post Job
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="ed-stats-grid">
        <div className="ed-stat-card">
          <div className="ed-stat-body">
            <p className="ed-stat-label">Total Jobs</p>
            <p className="ed-stat-value">{stats.totalJobs}</p>
          </div>
          <div className="ed-stat-icon ed-stat-icon--blue" aria-hidden="true">
            💼
          </div>
        </div>

        <div className="ed-stat-card">
          <div className="ed-stat-body">
            <p className="ed-stat-label">Total Applicants</p>
            <p className="ed-stat-value">{stats.totalApplications}</p>
          </div>
          <div className="ed-stat-icon ed-stat-icon--purple" aria-hidden="true">
            👥
          </div>
        </div>

        <div className="ed-stat-card">
          <div className="ed-stat-body">
            <p className="ed-stat-label">Pending Review</p>
            <p className="ed-stat-value ed-stat-value--orange">
              {stats.pendingApplications}
            </p>
            <p className="ed-stat-sub">Needs attention</p>
          </div>
          <div className="ed-stat-icon ed-stat-icon--orange" aria-hidden="true">
            🕐
          </div>
        </div>

        <div className="ed-stat-card">
          <div className="ed-stat-body">
            <p className="ed-stat-label">Accepted</p>
            <p className="ed-stat-value ed-stat-value--green">
              {stats.shortlistedApplications}
            </p>
            <p className="ed-stat-sub">Successful hires</p>
          </div>
          <div className="ed-stat-icon ed-stat-icon--green" aria-hidden="true">
            ✅
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="ed-panels">
        {/* Recent Applicants */}
        <section className="ed-panel">
          <div className="ed-panel-header">
            <h2>Recent Applicants</h2>
            <Link className="ed-view-all" to="/applications/received">
              View All Applicants ({stats.totalApplications})
            </Link>
          </div>
          <div className="ed-applicant-list">
            {recentApplications.length === 0 ? (
              <p className="ed-empty">No applicants yet.</p>
            ) : (
              recentApplications.map((app) => (
                <div key={app._id} className="ed-applicant-card">
                  <div className="ed-applicant-info">
                    <h3>{app.name}</h3>
                    <p>{app.job?.title ?? '—'}</p>
                    <p className="ed-applicant-date">
                      Applied {formatDate(app.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={app.applicationStatus} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Active Job Postings */}
        <section className="ed-panel">
          <div className="ed-panel-header">
            <h2>Active Job Postings</h2>
            <Link className="ed-view-all" to="/my-jobs">
              View All ({stats.activeJobs})
            </Link>
          </div>
          <div className="ed-job-list">
            {activeJobs.length === 0 ? (
              <p className="ed-empty">No active job postings.</p>
            ) : (
              activeJobs.slice(0, 5).map((job) => (
                <div key={job._id} className="ed-job-card">
                  <div className="ed-job-card-top">
                    <h3>{job.title}</h3>
                    <span className="ed-active-badge">Active</span>
                  </div>
                  <div className="ed-job-meta">
                    📍 {job.location}
                    {job.workType && (
                      <>
                        <span>•</span>
                        {job.workType}
                      </>
                    )}
                  </div>
                  <div className="ed-job-footer">
                    <span>👤 {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
                    {job.pendingCount > 0 && (
                      <span className="ed-pending-count">
                        🕐 {job.pendingCount} pending
                      </span>
                    )}
                    <span className="ed-post-date">
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      {showPostJob && (
        <PostJobModal
          token={token}
          user={user}
          onClose={() => setShowPostJob(false)}
          onPosted={handleJobPosted}
        />
      )}
    </main>
  );
}
