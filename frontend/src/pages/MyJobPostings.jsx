import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MyJobPostings.css';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const WORK_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 30) return `${diff} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/* ── Edit Job Modal ── */

function EditModal({ token, job, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: job.title ?? '',
    company: job.company ?? '',
    location: job.location ?? '',
    description: job.description ?? '',
    requirements: (job.requirements ?? []).join('\n'),
    salaryRange: job.salaryRange ?? '',
    workType: job.workType ?? 'Full-time',
    status: job.status ?? 'active',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        status: form.status,
      };
      if (form.salaryRange.trim()) body.salaryRange = form.salaryRange.trim();
      if (form.requirements.trim()) {
        body.requirements = form.requirements
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean);
      }

      const res = await fetch(`${API}/api/jobs/${job._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to save');
      setMsg({ type: 'success', text: 'Job updated successfully!' });
      onSaved(data);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/jobs/${job._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Delete failed');
      }
      onSaved(null); // null = deleted
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div
      className="mjp-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mjp-modal">
        <div className="mjp-modal-header">
          <div>
            <h2>Edit Job</h2>
            <p>Update your listing details below.</p>
          </div>
          <button className="mjp-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mjp-form-grid">
            <label>
              Job Title *
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              Company *
              <input name="company" value={form.company} onChange={handleChange} required />
            </label>
            <label>
              Location *
              <input name="location" value={form.location} onChange={handleChange} required />
            </label>
            <label>
              Work Type *
              <select name="workType" value={form.workType} onChange={handleChange} required>
                {WORK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
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
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="mjp-form-span">
              Description *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </label>
            <label className="mjp-form-span">
              Requirements (one per line)
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="3+ years of React experience"
              />
            </label>
          </div>

          {msg && <div className={`mjp-msg mjp-msg--${msg.type}`}>{msg.text}</div>}

          <div className="mjp-modal-actions">
            {confirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.83rem', color: '#b91c1c' }}>
                  Delete this job?
                </span>
                <button
                  type="button"
                  className="mjp-btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  className="mjp-btn-outline"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mjp-btn-danger"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Job
              </button>
            )}
            <div className="mjp-modal-actions-right">
              <button
                type="button"
                className="mjp-btn-outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="mjp-btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

EditModal.propTypes = {
  token: PropTypes.string,
  job: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    company: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    requirements: PropTypes.arrayOf(PropTypes.string),
    salaryRange: PropTypes.string,
    workType: PropTypes.string,
    status: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

/* ── Post New Job Modal ── */
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

      const res = await fetch(`${API}/api/jobs`, {
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
      setSaving(false);
    }
  };

  return (
    <div
      className="mjp-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mjp-modal">
        <div className="mjp-modal-header">
          <div>
            <h2>Post a New Job</h2>
            <p>Fill in the details to publish your listing.</p>
          </div>
          <button className="mjp-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mjp-form-grid">
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
                  <option key={t} value={t}>{t}</option>
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
            <label className="mjp-form-span">
              Description *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the role and responsibilities…"
                required
              />
            </label>
            <label className="mjp-form-span">
              Requirements (one per line)
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="3+ years of React experience"
              />
            </label>
          </div>
          {msg && <div className={`mjp-msg mjp-msg--${msg.type}`}>{msg.text}</div>}
          <div className="mjp-modal-actions">
            <div />
            <div className="mjp-modal-actions-right">
              <button
                type="button"
                className="mjp-btn-outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="mjp-btn-primary" disabled={saving}>
                {saving ? 'Posting…' : 'Post Job'}
              </button>
            </div>
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

/* ── Main page ── */
export default function MyJobPostings() {
  const { token, user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all'); // 'all' | 'active' | 'inactive'
  const [page, setPage] = useState(1);

  const [editingJob, setEditingJob] = useState(null);
  const [showPostJob, setShowPostJob] = useState(false);

  const debounceRef = useRef(null);

  const fetchJobs = useCallback(
    async (q, status, pg) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: pg, limit: 10 });
        if (q) params.set('q', q);
        if (status) params.set('status', status);

        const [jobsRes, statsRes] = await Promise.all([
          fetch(`${API}/api/jobs/mine?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/jobs/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [jobsData, statsData] = await Promise.all([
          jobsRes.json(),
          statsRes.json(),
        ]);

        if (!jobsRes.ok) throw new Error(jobsData.message ?? 'Failed to load jobs');
        setJobs(jobsData.data ?? []);
        setPagination(jobsData.pagination ?? null);
        if (statsRes.ok) setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch on mount and when tab/page change
  useEffect(() => {
    const statusParam = tab === 'active' ? 'active' : tab === 'inactive' ? 'closed' : '';
    fetchJobs(search, statusParam, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const statusParam = tab === 'active' ? 'active' : tab === 'inactive' ? 'closed' : '';
      fetchJobs(val, statusParam, 1);
    }, 350);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
  };

  const handleJobSaved = (updatedJob) => {
    if (updatedJob === null) {
      // deleted
      setEditingJob(null);
      const statusParam = tab === 'active' ? 'active' : tab === 'inactive' ? 'closed' : '';
      fetchJobs(search, statusParam, page);
      return;
    }
    setJobs((prev) =>
      prev.map((j) =>
        j._id === updatedJob._id
          ? { ...updatedJob, applicationCount: j.applicationCount, pendingCount: j.pendingCount }
          : j
      )
    );
    setEditingJob(null);
    // refresh stats
    fetch(`${API}/api/jobs/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  };

  const handlePosted = () => {
    setShowPostJob(false);
    const statusParam = tab === 'active' ? 'active' : tab === 'inactive' ? 'closed' : '';
    setPage(1);
    fetchJobs(search, statusParam, 1);
  };

  if (error) {
    return (
      <main className="mjp-page">
        <p className="mjp-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="mjp-page">
      {/* Back link */}
      <Link className="mjp-back" to="/dashboard">
        ← Back to Dashboard
      </Link>

      {/* Title row */}
      <div className="mjp-title-row">
        <div className="mjp-title-copy">
          <h1>My Job Postings</h1>
          <p>Manage all your job listings in one place</p>
        </div>
        <button className="mjp-btn-primary" onClick={() => setShowPostJob(true)}>
          + Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="mjp-stats">
        <div className="mjp-stat-card">
          <div className="mjp-stat-body">
            <p className="mjp-stat-label">Total Jobs</p>
            <p className="mjp-stat-value">{stats?.totalJobs ?? '—'}</p>
          </div>
          <div className="mjp-stat-icon mjp-stat-icon--blue" aria-hidden="true">💼</div>
        </div>
        <div className="mjp-stat-card">
          <div className="mjp-stat-body">
            <p className="mjp-stat-label">Active</p>
            <p className="mjp-stat-value mjp-stat-value--green">{stats?.activeJobs ?? '—'}</p>
          </div>
          <div className="mjp-stat-icon mjp-stat-icon--green" aria-hidden="true">🟢</div>
        </div>
        <div className="mjp-stat-card">
          <div className="mjp-stat-body">
            <p className="mjp-stat-label">Total Applicants</p>
            <p className="mjp-stat-value">{stats?.totalApplications ?? '—'}</p>
          </div>
          <div className="mjp-stat-icon mjp-stat-icon--purple" aria-hidden="true">👥</div>
        </div>
        <div className="mjp-stat-card">
          <div className="mjp-stat-body">
            <p className="mjp-stat-label">Pending Review</p>
            <p className="mjp-stat-value mjp-stat-value--orange">
              {jobs.reduce((sum, j) => sum + (j.pendingCount ?? 0), 0)}
            </p>
          </div>
          <div className="mjp-stat-icon mjp-stat-icon--orange" aria-hidden="true">🕐</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mjp-toolbar">
        <div className="mjp-search-wrap">
          <span className="mjp-search-icon">🔍</span>
          <input
            className="mjp-search"
            type="text"
            placeholder="Search jobs by title, location, or industry…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="mjp-tabs" role="tablist">
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
            <button
              key={val}
              role="tab"
              aria-selected={tab === val}
              className={`mjp-tab${tab === val ? ' mjp-tab--active' : ''}`}
              onClick={() => handleTabChange(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Job list */}
      {loading ? (
        <p className="mjp-loading">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <p className="mjp-empty">
          {search
            ? 'No jobs match your search.'
            : tab !== 'all'
              ? `No ${tab} jobs found.`
              : "You haven't posted any jobs yet."}
        </p>
      ) : (
        <div className="mjp-job-list">
          {jobs.map((job) => (
            <div key={job._id} className="mjp-job-card">
              <div className="mjp-job-top">
                <div>
                  <div className="mjp-job-title-row">
                    <h2 className="mjp-job-title">{job.title}</h2>
                    <span className={job.status === 'active' ? 'mjp-badge-active' : 'mjp-badge-closed'}>
                      {job.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    {job.pendingCount > 0 && (
                      <span className="mjp-badge-pending">{job.pendingCount} Pending</span>
                    )}
                  </div>
                </div>
                <div className="mjp-job-actions">
                  <Link
                    className="mjp-btn-primary"
                    to={`/my-jobs/${job._id}`}
                  >
                    👁 Manage
                  </Link>
                  <button
                    className="mjp-btn-outline"
                    onClick={() => setEditingJob(job)}
                  >
                    ✏ Edit
                  </button>
                </div>
              </div>

              <div className="mjp-job-meta">
                <span className="mjp-meta-item">📍 {job.location}</span>
                {job.workType && (
                  <span className="mjp-meta-item">🏢 {job.workType}</span>
                )}
                <span className="mjp-meta-item">🕐 Posted {formatDate(job.createdAt)}</span>
              </div>

              {job.description && (
                <p className="mjp-job-desc">{job.description}</p>
              )}

              <div className="mjp-job-footer">
                <span className="mjp-applicant-count">
                  👤 {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
                </span>
                {job.salaryRange && (
                  <span className="mjp-salary">{job.salaryRange}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mjp-pagination">
          <button
            className="mjp-page-btn"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="mjp-page-btn"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      {editingJob && (
        <EditModal
          token={token}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSaved={handleJobSaved}
        />
      )}
      {showPostJob && (
        <PostJobModal
          token={token}
          user={user}
          onClose={() => setShowPostJob(false)}
          onPosted={handlePosted}
        />
      )}
    </main>
  );
}
