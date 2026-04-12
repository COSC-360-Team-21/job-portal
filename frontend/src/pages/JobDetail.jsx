import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [id]);

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
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
