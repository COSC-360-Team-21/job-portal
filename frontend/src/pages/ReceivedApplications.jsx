import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ReceivedApplications.css';

const STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected'];

const STATUS_COLORS = {
  pending: 'ra-badge--pending',
  reviewed: 'ra-badge--reviewed',
  shortlisted: 'ra-badge--shortlisted',
  rejected: 'ra-badge--rejected',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
  });
}

export default function ReceivedApplications() {
  const { token } = useAuth();

  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [jobs, setJobs] = useState([]); // for Filter by Job dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const debounceRef = useRef(null);

  const fetchApplications = useCallback(
    async (q, jobId, status, pg) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: pg, limit: 10 });
        if (q) params.set('search', q);
        if (jobId) params.set('jobId', jobId);
        if (status) params.set('applicationStatus', status);

        const res = await fetch(`/api/applications/received?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Failed to load applications');
        setApplications(data.data ?? []);
        setPagination(data.pagination ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch my jobs list for the filter dropdown
  useEffect(() => {
    fetch(`/api/jobs/mine?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setJobs(d.data ?? []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    fetchApplications(search, filterJob, filterStatus, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterJob, filterStatus, page]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchApplications(val, filterJob, filterStatus, 1);
    }, 350);
  };

  const handleFilterJob = (e) => {
    setFilterJob(e.target.value);
    setPage(1);
  };

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

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
      if (!res.ok) throw new Error('Failed to update status');
      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, applicationStatus: newStatus } : a
        )
      );
    } catch {
      // silently fail — could add toast
    }
  };

  const total = pagination?.totalItems ?? applications.length;

  return (
    <main className="ra-page">
      <Link className="ra-back" to="/dashboard">
        ← Back to Dashboard
      </Link>

      <div className="ra-header">
        <h1 className="ra-title">All Applicants</h1>
        <p className="ra-subtitle">View and manage all job applications</p>
      </div>

      {/* Filters */}
      <div className="ra-filters">
        <div className="ra-filter-group">
          <label className="ra-filter-label">Search</label>
          <div className="ra-search-wrap">
            <span className="ra-search-icon">🔍</span>
            <input
              className="ra-search"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, email, or job..."
            />
          </div>
        </div>

        <div className="ra-filter-group">
          <label className="ra-filter-label">Filter by Job</label>
          <select className="ra-select" value={filterJob} onChange={handleFilterJob}>
            <option value=""></option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        </div>

        <div className="ra-filter-group">
          <label className="ra-filter-label">Filter by Status</label>
          <select className="ra-select" value={filterStatus} onChange={handleFilterStatus}>
            <option value=""></option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="ra-results-box">
        {error ? (
          <p className="ra-empty">{error}</p>
        ) : loading ? (
          <p className="ra-empty">Loading applicants…</p>
        ) : (
          <>
            <p className="ra-count">Showing {total} applicant{total !== 1 ? 's' : ''}</p>

            {applications.length === 0 ? (
              <p className="ra-empty">No applications match your filters.</p>
            ) : (
              <div className="ra-list">
                {applications.map((app) => {
                  const initial = (app.name ?? '?').charAt(0).toUpperCase();
                  const job = app.job ?? {};
                  return (
                    <div key={app._id} className="ra-card">
                      <div className="ra-card-top">
                        <div className="ra-card-left">
                          <div className="ra-avatar">{initial}</div>
                          <div className="ra-info">
                            <div className="ra-name-row">
                              <span className="ra-name">{app.name}</span>
                              <span className={`ra-badge ${STATUS_COLORS[app.applicationStatus]}`}>
                                {app.applicationStatus}
                              </span>
                            </div>
                            <p className="ra-meta">✉ {app.email}</p>
                            <p className="ra-meta">📅 Applied {formatDate(app.createdAt)}</p>
                          </div>
                        </div>
                        <div className="ra-card-actions">
                          <Link
                            className="ra-btn-view"
                            to={`/my-jobs/${job._id}`}
                          >
                            👁 View Details
                          </Link>
                        </div>
                      </div>

                      {/* Job info card */}
                      {job._id && (
                        <div className="ra-job-card">
                          <p className="ra-job-applied-for">Applied for</p>
                          <p className="ra-job-title">{job.title}</p>
                          <div className="ra-job-meta-grid">
                            <span>📍 {job.location ?? '—'}</span>
                            <span>🕐 {job.workType ?? '—'}</span>
                            {job.salaryRange && <span>💲 {job.salaryRange}</span>}
                            {job.industry && <span>🏢 {job.industry}</span>}
                          </div>
                        </div>
                      )}

                      {/* Cover letter / message */}
                      {app.additionalMessage && (
                        <div className="ra-cover">
                          <span className="ra-cover-label">Cover Letter:</span>
                          <span className="ra-cover-text">{app.additionalMessage}</span>
                        </div>
                      )}

                      {/* Inline status changer */}
                      <div className="ra-status-row">
                        <label className="ra-status-label">Update Status:</label>
                        <select
                          className="ra-status-select"
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
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="ra-pagination">
                <button
                  className="ra-page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  ← Prev
                </button>
                <span className="ra-page-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="ra-page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
