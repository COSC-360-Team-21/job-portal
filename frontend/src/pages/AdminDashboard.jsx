import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import './AdminDashboard.css';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const { token, user, authLoading } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    const hdrs = { Authorization: `Bearer ${token}` };
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: hdrs }),
        fetch('/api/admin/activity?days=30', { headers: hdrs }),
      ]);
      const [statsData, activityData] = await Promise.all([
        statsRes.json(), activityRes.json(),
      ]);
      if (!statsRes.ok) throw new Error(statsData.message);
      setStats(statsData);
      if (activityRes.ok) setActivity(activityData.activity || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    const hdrs = { Authorization: `Bearer ${token}` };
    try {
      const res = await fetch('/api/admin/users?limit=100', { headers: hdrs });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const fetchJobs = useCallback(async () => {
    const hdrs = { Authorization: `Bearer ${token}` };
    try {
      const res = await fetch('/api/admin/jobs?limit=100', { headers: hdrs });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setJobs(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const fetchApplications = useCallback(async () => {
    const hdrs = { Authorization: `Bearer ${token}` };
    try {
      const res = await fetch('/api/admin/applications?limit=100', { headers: hdrs });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApplications(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user || user.role !== 'admin') return;
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(), fetchJobs(), fetchApplications()])
      .finally(() => setLoading(false));
  }, [token, user, fetchStats, fetchUsers, fetchJobs, fetchApplications]);

  if (!authLoading && (!token || !user)) return <Navigate to="/login" replace />;
  if (!authLoading && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const toggleUserActive = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: data.isActive } : u)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Permanently delete this job?')) return;
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE', headers });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtered data
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch = j.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.company?.toLowerCase().includes(jobSearch.toLowerCase());
    const matchesStatus = jobStatusFilter === 'all' || j.status === jobStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Chart data
  const roleDistribution = [
    { name: 'Job Seekers', value: users.filter((u) => u.role === 'jobseeker').length },
    { name: 'Employers', value: users.filter((u) => u.role === 'employer').length },
    { name: 'Admins', value: users.filter((u) => u.role === 'admin').length },
  ].filter((d) => d.value > 0);

  const appStatusData = applications.reduce((acc, app) => {
    const status = app.applicationStatus || 'pending';
    const existing = acc.find((a) => a.name === status);
    if (existing) existing.value++;
    else acc.push({ name: status, value: 1 });
    return acc;
  }, []);

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <h1>Admin Dashboard</h1>
        <p>Monitor platform activity, manage users, and view analytics.</p>
      </div>

      <div className="admin-tabs">
        {['overview', 'users', 'jobs', 'applications'].map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">Loading admin data…</div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {tab === 'overview' && stats && (
            <>
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <h3>{stats.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
                <div className="admin-stat-card">
                  <h3>{stats.totalJobs || 0}</h3>
                  <p>Total Jobs</p>
                </div>
                <div className="admin-stat-card">
                  <h3>{stats.totalApplications || 0}</h3>
                  <p>Applications</p>
                </div>
                <div className="admin-stat-card">
                  <h3>{stats.totalComments || 0}</h3>
                  <p>Comments</p>
                </div>
              </div>

              <div className="admin-charts-grid">
                <div className="admin-chart-panel">
                  <h2>Activity Over Time (Last 30 Days)</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={activity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="registrations" stroke="#2563eb" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="jobs" stroke="#16a34a" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="applications" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="comments" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="admin-chart-panel">
                  <h2>User Distribution</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%" cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {roleDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="admin-chart-panel">
                  <h2>Application Status Breakdown</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={appStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="admin-chart-panel">
                  <h2>New Registrations (Last 30 Days)</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={activity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="registrations" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <>
              <div className="admin-filter-row">
                <input
                  className="admin-search-input"
                  placeholder="Search users by name or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <select
                  className="admin-filter-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="jobseeker">Job Seekers</option>
                  <option value="employer">Employers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`admin-badge admin-badge--${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${u.isActive !== false ? 'admin-badge--active' : 'admin-badge--disabled'}`}>
                            {u.isActive !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button
                            className={`admin-toggle-btn ${u.isActive !== false ? 'admin-toggle-btn--danger' : ''}`}
                            onClick={() => toggleUserActive(u._id)}
                          >
                            {u.isActive !== false ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            className="admin-toggle-btn admin-toggle-btn--danger"
                            onClick={() => deleteUser(u._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* JOBS TAB */}
          {tab === 'jobs' && (
            <>
              <div className="admin-filter-row">
                <input
                  className="admin-search-input"
                  placeholder="Search jobs by title or company…"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                />
                <select
                  className="admin-filter-select"
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Posted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((j) => (
                      <tr key={j._id}>
                        <td style={{ fontWeight: 600 }}>{j.title}</td>
                        <td>{j.company}</td>
                        <td>
                          <span className={`admin-badge ${j.status === 'active' ? 'admin-badge--active' : 'admin-badge--disabled'}`}>
                            {j.status}
                          </span>
                        </td>
                        <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="admin-toggle-btn admin-toggle-btn--danger"
                            onClick={() => deleteJob(j._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredJobs.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No jobs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* APPLICATIONS TAB */}
          {tab === 'applications' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{a.applicant?.name || 'Unknown'}</td>
                      <td>{a.job?.title || 'Unknown'}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${a.applicationStatus === 'shortlisted' ? 'active' : a.applicationStatus === 'rejected' ? 'disabled' : 'employer'}`}>
                          {a.applicationStatus}
                        </span>
                      </td>
                      <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>No applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default AdminDashboard;
