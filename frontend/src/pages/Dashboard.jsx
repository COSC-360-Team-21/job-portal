import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusLabel = (status) => {
  const map = {
    pending: "Pending",
    reviewed: "Under Review",
    shortlisted: "Interview",
    rejected: "Rejected",
  };
  return map[status] || status;
};

const getProfileCompletion = (profile, user) => {
  const fields = [
    user?.name,
    user?.email,
    profile?.phone,
    profile?.location,
    profile?.bio,
  ];

  const completed = fields.filter((value) => String(value || "").trim()).length;
  return Math.round((completed / fields.length) * 100);
};

const Dashboard = () => {
  const { token, user, authLoading } = useAuth();
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
  const [error, setError] = useState("");

  const profileCompletion = useMemo(
    () => getProfileCompletion(profile, user),
    [profile, user]
  );

  useEffect(() => {
    if (!token || !user || user.role !== "jobseeker") {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileRes, statsRes, applicationsRes, jobsRes] = await Promise.all([
          fetch("/api/profile", { headers }),
          fetch("/api/applications/stats", { headers }),
          fetch("/api/applications/mine?limit=2", { headers }),
          fetch("/api/jobs?limit=3"),
        ]);

        const [profileData, statsData, applicationsData, jobsData] = await Promise.all([
          profileRes.json(),
          statsRes.json(),
          applicationsRes.json(),
          jobsRes.json(),
        ]);

        if (!profileRes.ok) throw new Error(profileData.message || "Failed to load profile");
        if (!statsRes.ok) throw new Error(statsData.message || "Failed to load stats");
        if (!applicationsRes.ok) throw new Error(applicationsData.message || "Failed to load applications");
        if (!jobsRes.ok) throw new Error(jobsData.message || "Failed to load jobs");

        setProfile(profileData.profile || {});
        setStats(statsData || {});
        setApplications(applicationsData.data || []);
        setRecommendedJobs((jobsData.data || []).slice(0, 3));
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user]);

  if (!authLoading && (!token || !user)) {
    return <Navigate to="/login" replace />;
  }

  if (!authLoading && user?.role === "employer") {
    return (
      <section className="db-page">
        <div className="db-empty-state">
          <h1>Employer dashboard coming soon</h1>
          <p>
            You are logged in as an employer. For now, you can still browse jobs
            and use the rest of your existing app.
          </p>
          <Link className="db-primary-btn" to="/jobs">
            Browse Jobs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="db-page">
      <div className="db-hero">
        <div>
          <h1 className="db-title">Welcome back, {user?.name?.split(" ")[0] || "there"}!</h1>
          <p className="db-subtitle">
            Here&apos;s what&apos;s happening with your job search today.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="db-loading">Loading dashboard…</div>
      ) : error ? (
        <div className="db-error">{error}</div>
      ) : (
        <>
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
              <p>
                {profileCompletion}% complete, add more details to improve your job matches.
              </p>

              <div className="db-progress">
                <div
                  className="db-progress-bar"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <button
                className="db-secondary-btn"
                onClick={() => navigate("/my-applications")}
              >
                View Applications
              </button>
            </div>

            <div className="db-avatar">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>
          </div>

          <div className="db-main-grid">
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Recent Applications</h2>
                <Link to="/my-applications">View All</Link>
              </div>

              {applications.length === 0 ? (
                <p className="db-muted">
                  You haven&apos;t applied anywhere yet.
                </p>
              ) : (
                <div className="db-list">
                  {applications.map((app) => (
                    <div key={app._id} className="db-list-card">
                      <div className="db-list-icon">📄</div>

                      <div className="db-list-content">
                        <h3>{app.job?.title || "Untitled job"}</h3>
                        <p>{app.job?.company || "Unknown company"}</p>
                        <div className="db-meta-row">
                          <span>{app.job?.location || "No location"}</span>
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
                <button className="db-action-card" onClick={() => navigate("/jobs")}>
                  <strong>Browse Jobs</strong>
                  <span>Explore new opportunities</span>
                </button>

                <button className="db-action-card" onClick={() => navigate("/my-applications")}>
                  <strong>My Applications</strong>
                  <span>Track your submitted jobs</span>
                </button>

                <button className="db-action-card" onClick={() => navigate("/industries")}>
                  <strong>Explore Industries</strong>
                  <span>Discover categories and roles</span>
                </button>

                <button className="db-action-card" onClick={() => navigate("/search")}>
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
    </section>
  );
};

export default Dashboard;