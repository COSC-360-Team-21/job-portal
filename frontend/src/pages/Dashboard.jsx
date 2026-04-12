import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployerDashboard from './EmployerDashboard';
import './Dashboard.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusLabel = (status) => {
  const map = {
    pending: 'Pending',
    reviewed: 'Under Review',
    shortlisted: 'Interview',
    rejected: 'Rejected',
  };
  return map[status] || status;
};

const splitCsv = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getProfileCompletion = (profile, user) => {
  const fields = [
    user?.name,
    user?.email,
    profile?.headline,
    profile?.phone,
    profile?.location,
    profile?.bio,
    profile?.skills?.length ? 'yes' : '',
    profile?.preferredIndustries?.length ? 'yes' : '',
  ];

  const completed = fields.filter((value) => String(value || '').trim()).length;
  return Math.round((completed / fields.length) * 100);
};

const createFormState = (user, profile) => ({
  name: user?.name || '',
  headline: profile?.headline || '',
  phone: profile?.phone || '',
  location: profile?.location || '',
  skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : '',
  preferredIndustries: Array.isArray(profile?.preferredIndustries)
    ? profile.preferredIndustries.join(', ')
    : '',
  bio: profile?.bio || '',
});

const Dashboard = () => {
  const { token, user, authLoading, persistAuth } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [form, setForm] = useState(createFormState(user, profile));
  const imageInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const profileCompletion = useMemo(() => getProfileCompletion(profile, user), [profile, user]);

  useEffect(() => {
    setForm(createFormState(user, profile));
  }, [user, profile]);

  useEffect(() => {
    if (!token || !user || user.role !== 'jobseeker') {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, statsRes, applicationsRes, jobsRes] = await Promise.all([
          fetch('/api/profile', { headers }),
          fetch('/api/applications/stats', { headers }),
          fetch('/api/applications/mine?limit=2', { headers }),
          fetch('/api/jobs?limit=3'),
        ]);

        const [profileData, statsData, applicationsData, jobsData] = await Promise.all([
          profileRes.json(),
          statsRes.json(),
          applicationsRes.json(),
          jobsRes.json(),
        ]);

        if (!profileRes.ok) throw new Error(profileData.message || 'Failed to load profile');
        if (!statsRes.ok) throw new Error(statsData.message || 'Failed to load stats');
        if (!applicationsRes.ok) throw new Error(applicationsData.message || 'Failed to load applications');
        if (!jobsRes.ok) throw new Error(jobsData.message || 'Failed to load jobs');

        setProfile(profileData.profile || {});
        setStats(statsData || {});
        setApplications(applicationsData.data || []);
        setRecommendedJobs((jobsData.data || []).slice(0, 3));
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user]);

  if (!authLoading && (!token || !user)) {
    return <Navigate to="/login" replace />;
  }

  if (!authLoading && user?.role === 'employer') {
    return <EmployerDashboard />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setSaveMessage('');

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          profile: {
            headline: form.headline,
            phone: form.phone,
            location: form.location,
            skills: splitCsv(form.skills),
            preferredIndustries: splitCsv(form.preferredIndustries),
            bio: form.bio,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.errors?.[0]?.msg || data.message || 'Failed to update profile');
      }

      setProfile(data.profile || {});
      persistAuth(token, data);
      setEditingProfile(false);
      setConfirmingSave(false);
      setSaveMessage('Profile updated successfully. Your dashboard and header are now refreshed.');
    } catch (err) {
      setSaveMessage(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('profileImage', file);
      const res = await fetch('/api/profile/image', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      persistAuth(token, { ...user, profileImage: data.profileImage });
      setSaveMessage('Profile image updated!');
    } catch (err) {
      setSaveMessage(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <section className="db-page">
      <div className="db-hero">
        <div>
          <h1 className="db-title">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
          <p className="db-subtitle">Here&apos;s what&apos;s happening with your job search today.</p>
        </div>
      </div>

      {loading ? (
        <div className="db-loading">Loading dashboard…</div>
      ) : error ? (
        <div className="db-error">{error}</div>
      ) : (
        <>
          <div className="db-profile-shell">
            <div className="db-profile-cover" />

            <div className="db-profile-card">
              <div className="db-profile-top-row">
                <div className="db-profile-identity">
                  <div className="db-profile-avatar-lg" onClick={() => imageInputRef.current?.click()} title="Click to change photo" style={{ cursor: 'pointer', position: 'relative' }}>
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      (user?.name?.[0] || 'U').toUpperCase()
                    )}
                    <span className="db-avatar-edit-overlay">{uploadingImage ? '…' : '📷'}</span>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />

                  <div>
                    <h2>{user?.name || 'Your profile'}</h2>
                    <p className="db-profile-headline">
                      {profile?.headline || 'Add a headline so employers understand your strengths quickly.'}
                    </p>

                    <div className="db-profile-meta">
                      <span>{profile?.location || 'Location not added'}</span>
                      <span>{user?.email}</span>
                      <span>Joined {formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="db-profile-actions">
                  <button
                    className="db-primary-btn db-primary-btn--auto"
                    onClick={() => setEditingProfile(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="db-profile-grid">
                <div className="db-panel">
                  <div className="db-panel-header">
                    <h2>Skills</h2>
                    <button className="db-link-btn" onClick={() => setEditingProfile(true)}>
                      + Add Skill
                    </button>
                  </div>

                  <div className="db-chip-wrap">
                    {(profile?.skills || []).length ? (
                      profile.skills.map((skill) => (
                        <span key={skill} className="db-chip db-chip--blue">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="db-muted">No skills added yet.</p>
                    )}
                  </div>
                </div>

                <div className="db-panel">
                  <div className="db-panel-header">
                    <h2>Preferred Industries</h2>
                    <button className="db-link-btn" onClick={() => setEditingProfile(true)}>
                      + Add Industry
                    </button>
                  </div>

                  <div className="db-chip-wrap">
                    {(profile?.preferredIndustries || []).length ? (
                      profile.preferredIndustries.map((industry) => (
                        <span key={industry} className="db-chip db-chip--green">
                          {industry}
                        </span>
                      ))
                    ) : (
                      <p className="db-muted">No industries added yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="db-panel">
                <div className="db-panel-header">
                  <h2>Bio</h2>
                  <button className="db-link-btn" onClick={() => setEditingProfile(true)}>
                    Edit
                  </button>
                </div>

                <p className="db-bio-copy">
                  {profile?.bio || 'Tell employers more about your background, goals, and what kind of role you are looking for.'}
                </p>
              </div>
            </div>
          </div>

          {saveMessage && <div className="db-save-banner">{saveMessage}</div>}

          <div className="db-stats-grid">
            <div className="db-stat-card">
              <p className="db-stat-label">Total Applications</p>
              <h2 className="db-stat-value">{stats.total || 0}</h2>
            </div>

            <div className="db-stat-card">
              <p className="db-stat-label">Under Review</p>
              <h2 className="db-stat-value">{stats.reviewed || 0}</h2>
            </div>

            <div className="db-stat-card">
              <p className="db-stat-label">Interviews</p>
              <h2 className="db-stat-value">{stats.shortlisted || 0}</h2>
            </div>

            <div className="db-stat-card">
              <p className="db-stat-label">Pending</p>
              <h2 className="db-stat-value">{stats.pending || 0}</h2>
            </div>
          </div>

          <div className="db-profile-banner">
            <div className="db-profile-copy">
              <h2>Complete Your Profile</h2>
              <p>{profileCompletion}% complete, add more details to improve your job matches.</p>

              <div className="db-progress">
                <div className="db-progress-bar" style={{ width: `${profileCompletion}%` }} />
              </div>

              <div className="db-banner-actions">
                <button className="db-secondary-btn" onClick={() => setEditingProfile(true)}>
                  Update Profile
                </button>

                <button
                  className="db-secondary-btn db-secondary-btn--ghost"
                  onClick={() => navigate('/my-applications')}
                >
                  View Applications
                </button>
              </div>
            </div>

            <div className="db-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                (user?.name?.[0] || 'U').toUpperCase()
              )}
            </div>
          </div>

          <div className="db-main-grid">
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Recent Applications</h2>
                <Link to="/my-applications">View All</Link>
              </div>

              {applications.length === 0 ? (
                <p className="db-muted">You haven&apos;t applied anywhere yet.</p>
              ) : (
                <div className="db-list">
                  {applications.map((app) => (
                    <div key={app._id} className="db-list-card">
                      <div className="db-list-icon">📄</div>

                      <div className="db-list-content">
                        <h3>{app.job?.title || 'Untitled job'}</h3>
                        <p>{app.job?.company || 'Unknown company'}</p>

                        <div className="db-meta-row">
                          <span>{app.job?.location || 'No location'}</span>
                          <span>{formatDate(app.createdAt)}</span>
                        </div>

                        <span className={`db-status db-status--${app.applicationStatus}`}>
                          {getStatusLabel(app.applicationStatus)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Quick Actions</h2>
              </div>

              <div className="db-actions">
                <button className="db-action-card" onClick={() => navigate('/jobs')}>
                  <strong>Browse Jobs</strong>
                  <span>Explore new opportunities</span>
                </button>

                <button className="db-action-card" onClick={() => navigate('/my-applications')}>
                  <strong>My Applications</strong>
                  <span>Track your submitted jobs</span>
                </button>

                <button className="db-action-card" onClick={() => navigate('/industries')}>
                  <strong>Explore Industries</strong>
                  <span>Discover categories and roles</span>
                </button>

                <button className="db-action-card" onClick={() => navigate('/search')}>
                  <strong>Search Jobs</strong>
                  <span>Find a specific role faster</span>
                </button>
              </div>
            </div>
          </div>

          <div className="db-panel db-bottom-panel">
            <div className="db-panel-header">
              <h2>Recommended for You</h2>
              <Link to="/jobs">View All Jobs</Link>
            </div>

            {recommendedJobs.length === 0 ? (
              <p className="db-muted">No jobs available yet.</p>
            ) : (
              <div className="db-recommend-grid">
                {recommendedJobs.map((job) => (
                  <div key={job._id} className="db-job-card">
                    <div className="db-job-top">
                      <div className="db-job-logo">💼</div>

                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.company}</p>
                      </div>
                    </div>

                    <div className="db-job-meta">
                      <span>{job.location}</span>
                      {job.salaryRange && <span>{job.salaryRange}</span>}
                      <span>{job.workType}</span>
                    </div>

                    <button
                      className="db-primary-btn"
                      onClick={() => navigate(`/jobs/${job._id}`)}
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {editingProfile && (
        <div
          className="db-modal-backdrop"
          onClick={() => !savingProfile && setEditingProfile(false)}
        >
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <div>
                <h2>Edit Profile</h2>
                <p>Update your job seeker profile details, then review before saving.</p>
              </div>

              <button
                className="db-modal-close"
                onClick={() => setEditingProfile(false)}
                aria-label="Close edit profile modal"
              >
                ×
              </button>
            </div>

            <div className="db-form-grid">
              <label>
                Full Name
                <input name="name" value={form.name} onChange={handleChange} />
              </label>

              <label>
                Headline
                <input
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  placeholder="UBC student | React developer | Open to internships"
                />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 236 555 1234"
                />
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Kelowna, BC"
                />
              </label>

              <label className="db-form-span">
                Skills
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="JavaScript, React, Node.js, TypeScript"
                />
              </label>

              <label className="db-form-span">
                Preferred Industries
                <input
                  name="preferredIndustries"
                  value={form.preferredIndustries}
                  onChange={handleChange}
                  placeholder="Technology, Software, Web Development"
                />
              </label>

              <label className="db-form-span">
                Bio
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Write a short summary about your experience and goals."
                />
              </label>
            </div>

            <div className="db-preview-box">
              <strong>Preview before saving</strong>
              <p>{form.headline || 'Your headline will appear here.'}</p>
              <p>{form.location || 'Location not added yet'}</p>
            </div>

            <div className="db-modal-actions">
              <button
                className="db-secondary-btn db-secondary-btn--ghost-dark"
                onClick={() => { setEditingProfile(false); setConfirmingSave(false); }}
                disabled={savingProfile}
              >
                Cancel
              </button>

              <button
                className="db-primary-btn db-primary-btn--auto"
                onClick={() => setConfirmingSave(true)}
                disabled={savingProfile}
              >
                Review Save
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmingSave && (
        <div
          className="db-modal-backdrop"
          onClick={() => !savingProfile && setConfirmingSave(false)}
        >
          <div className="db-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure?</h3>
            <p>
              Your profile details will be updated for your account and reflected in the
              dashboard header.
            </p>

            <div className="db-confirm-actions">
              <button
                className="db-secondary-btn db-secondary-btn--ghost-dark"
                onClick={() => setConfirmingSave(false)}
                disabled={savingProfile}
              >
                Go Back
              </button>

              <button
                className="db-primary-btn db-primary-btn--auto"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving…' : 'Yes, Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;