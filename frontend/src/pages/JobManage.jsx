import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './JobManage.css';

const STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected'];
const WORK_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const STATUS_COLORS = {
  pending: 'jm-badge--pending',
  reviewed: 'jm-badge--reviewed',
  shortlisted: 'jm-badge--shortlisted',
  rejected: 'jm-badge--rejected',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function JobManage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('applicants');
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [error, setError] = useState(null);

  /* ── Edit state ── */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editMsg, setEditMsg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch job ── */
  useEffect(() => {
    setLoadingJob(true);
    fetch(`/api/jobs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data._id) {
          setJob(data);
          setEditForm({
            title: data.title ?? '',
            company: data.company ?? '',
            location: data.location ?? '',
            description: data.description ?? '',
            requirements: (data.requirements ?? []).join('\n'),
            workType: data.workType ?? 'Full-time',
            salaryRange: data.salaryRange ?? '',
            status: data.status ?? 'active',
            industry: data.industry ?? '',
          });
        } else {
          setError(data.message ?? 'Job not found');
        }
      })
      .catch(() => setError('Failed to load job'))
      .finally(() => setLoadingJob(false));
  }, [id, token]);

  /* ── Fetch applications ── */
  useEffect(() => {
    setLoadingApps(true);
    fetch(`/api/applications/received?jobId=${id}&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setApplications(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  }, [id, token]);

  /* ── Edit handlers ── */
  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setEditMsg(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditMsg(null);
    try {
      const body = {
        title: editForm.title.trim(),
        company: editForm.company.trim(),
        location: editForm.location.trim(),
        description: editForm.description.trim(),
        workType: editForm.workType,
        status: editForm.status,
      };
      if (editForm.salaryRange.trim()) body.salaryRange = editForm.salaryRange.trim();
      if (editForm.industry.trim()) body.industry = editForm.industry.trim();
      if (editForm.requirements.trim()) {
        body.requirements = editForm.requirements
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean);
      }

      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to save');
      setJob(data);
      setEditMsg({ type: 'success', text: 'Job updated!' });
      setEditing(false);
    } catch (err) {
      setEditMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Delete failed');
      }
      navigate('/my-jobs');
    } catch (err) {
      setEditMsg({ type: 'error', text: err.message });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  /* ── Status update ── */
  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationStatus: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      setApplications((prev) =>
        prev.map((a) => a._id === appId ? { ...a, applicationStatus: newStatus } : a)
      );
    } catch {
      // silently ignore
    }
  };

  if (loadingJob) {
    return <main className="jm-page"><p className="jm-empty">Loading…</p></main>;
  }

  if (error) {
    return (
      <main className="jm-page">
        <p className="jm-error">{error}</p>
        <Link to="/my-jobs" className="jm-back">← Back to My Jobs</Link>
      </main>
    );
  }

  return (
    <main className="jm-page">
      {/* Top bar */}
      <div className="jm-topbar">
        <Link className="jm-back" to="/dashboard">
          ← Back to Dashboard
        </Link>
        <div className="jm-topbar-actions">
          {!editing ? (
            <>
              <button className="jm-btn-edit" onClick={() => setEditing(true)}>
                ✏ Edit Job
              </button>
              {confirmDelete ? (
                <>
                  <span className="jm-confirm-text">Delete this job?</span>
                  <button
                    className="jm-btn-delete-confirm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                  <button
                    className="jm-btn-cancel-sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="jm-btn-delete" onClick={() => setConfirmDelete(true)}>
                  🗑 Delete
                </button>
              )}
            </>
          ) : (
            <button className="jm-btn-cancel-sm" onClick={() => { setEditing(false); setEditMsg(null); }}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="jm-tabs">
        <button
          className={`jm-tab${tab === 'details' ? ' jm-tab--active' : ''}`}
          onClick={() => setTab('details')}
        >
          Job Details
        </button>
        <button
          className={`jm-tab${tab === 'applicants' ? ' jm-tab--active' : ''}`}
          onClick={() => setTab('applicants')}
        >
          Applicants ({applications.length})
        </button>
      </div>

      {/* ── Job Details tab ── */}
      {tab === 'details' && (
        <div className="jm-card">
          {!editing ? (
            <>
              <h1 className="jm-job-title">{job.title}</h1>
              <div className="jm-job-meta">
                <span>{job.company}</span>
                <span>·</span>
                <span>{job.location}</span>
                <span>·</span>
                <span>{job.workType}</span>
                {job.status && (
                  <>
                    <span>·</span>
                    <span className={`jm-status-pill jm-status-pill--${job.status}`}>
                      {job.status}
                    </span>
                  </>
                )}
              </div>
              {job.salaryRange && (
                <p className="jm-detail-row">
                  <span className="jm-detail-key">Salary:</span> {job.salaryRange}
                </p>
              )}
              {job.industry && (
                <p className="jm-detail-row">
                  <span className="jm-detail-key">Industry:</span> {job.industry}
                </p>
              )}
              <div className="jm-section">
                <h2 className="jm-section-title">Description</h2>
                <p className="jm-description">{job.description}</p>
              </div>
              {job.requirements?.length > 0 && (
                <div className="jm-section">
                  <h2 className="jm-section-title">Requirements</h2>
                  <ul className="jm-req-list">
                    {job.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleEditSubmit} className="jm-edit-form">
              <h2 className="jm-section-title">Edit Job</h2>

              <div className="jm-field-row">
                <div className="jm-field">
                  <label className="jm-label" htmlFor="jm-title">Job Title *</label>
                  <input id="jm-title" className="jm-input" name="title" value={editForm.title} onChange={handleEditChange} required />
                </div>
                <div className="jm-field">
                  <label className="jm-label" htmlFor="jm-company">Company *</label>
                  <input id="jm-company" className="jm-input" name="company" value={editForm.company} onChange={handleEditChange} required />
                </div>
              </div>

              <div className="jm-field-row">
                <div className="jm-field">
                  <label className="jm-label" htmlFor="jm-location">Location *</label>
                  <input id="jm-location" className="jm-input" name="location" value={editForm.location} onChange={handleEditChange} required />
                </div>
                <div className="jm-field">
                  <label className="jm-label" htmlFor="jm-workType">Work Type *</label>
                  <select id="jm-workType" className="jm-input jm-select" name="workType" value={editForm.workType} onChange={handleEditChange} required>
                    {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="jm-field-row">
                <div className="jm-field">
                  <label className="jm-label" htmlFor="jm-industry">Industry</label>
                  <input id="jm-industry" className="jm-input" name="industry" value={editForm.industry} onChange={handleEditChange} placeholder="Technology" />
                </div>
                <div className="jm-field">
                  <label className="jm-label" htmlFor="jm-salaryRange">Salary Range</label>
                  <input id="jm-salaryRange" className="jm-input" name="salaryRange" value={editForm.salaryRange} onChange={handleEditChange} placeholder="e.g. $80k – $100k" />
                </div>
              </div>

              <div className="jm-field-row">
                <div className="jm-field">
                  <label className="jm-label" htmlFor="jm-status">Status</label>
                  <select id="jm-status" className="jm-input jm-select" name="status" value={editForm.status} onChange={handleEditChange}>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="jm-field">
                <label className="jm-label" htmlFor="jm-description">Description *</label>
                <textarea id="jm-description" className="jm-input jm-textarea" name="description" value={editForm.description} onChange={handleEditChange} rows={5} required />
              </div>

              <div className="jm-field">
                <label className="jm-label" htmlFor="jm-requirements">Requirements (one per line)</label>
                <textarea id="jm-requirements" className="jm-input jm-textarea" name="requirements" value={editForm.requirements} onChange={handleEditChange} rows={4} placeholder="3+ years of React experience" />
              </div>

              {editMsg && (
                <div className={`jm-msg jm-msg--${editMsg.type}`}>{editMsg.text}</div>
              )}

              <div className="jm-edit-actions">
                <button type="submit" className="jm-btn-save" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="jm-btn-cancel-sm" onClick={() => { setEditing(false); setEditMsg(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Applicants tab ── */}
      {tab === 'applicants' && (
        <div className="jm-card">
          <div className="jm-app-header">
            <h2 className="jm-app-title">Applicants</h2>
            <p className="jm-app-sub">Review and manage applications for this job posting</p>
          </div>

          {loadingApps ? (
            <p className="jm-empty">Loading applicants…</p>
          ) : applications.length === 0 ? (
            <p className="jm-empty">No applicants yet for this job.</p>
          ) : (
            <div className="jm-table-wrap">
              <table className="jm-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div className="jm-applicant-cell">
                          <span className={`jm-dot jm-dot--${app.applicationStatus}`} />
                          <span className="jm-applicant-name">{app.name}</span>
                        </div>
                      </td>
                      <td className="jm-email">{app.email}</td>
                      <td className="jm-date">{formatDate(app.createdAt)}</td>
                      <td>
                        <span className={`jm-badge ${STATUS_COLORS[app.applicationStatus]}`}>
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td>
                        <div className="jm-actions-cell">
                          <Link
                            to={`/applications/received`}
                            state={{ appId: app._id }}
                            className="jm-btn-view"
                          >
                            👁 View
                          </Link>
                          <select
                            className="jm-status-select"
                            value={app.applicationStatus}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
