import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "../components/JobCard";
import "./JobListings.css";

const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const matches = (value, term) =>
  String(value ?? "").toLowerCase().includes(term.toLowerCase());

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const JobListings = () => {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/jobs?limit=100");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        setAllJobs(json.data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const results = useMemo(() => {
    return allJobs.filter((job) => {
      if (query.trim()) {
        const term = query.trim();
        const inTitle = matches(job.title, term);
        const inCompany = matches(job.company, term);
        const inDescription = matches(job.description, term);
        const inReqs = (job.requirements ?? []).some((r) => matches(r, term));
        if (!inTitle && !inCompany && !inDescription && !inReqs) return false;
      }
      if (location.trim() && !matches(job.location, location.trim())) return false;
      if (workType && job.workType !== workType) return false;
      return true;
    });
  }, [allJobs, query, location, workType]);

  return (
    <section className="jl-page">
      <div className="jl-header">
        <h1 className="jl-title">Browse Jobs</h1>
        <p className="jl-subtitle">
          {loading ? "Loading…" : `${results.length} opportunit${results.length !== 1 ? "ies" : "y"} available`}
        </p>
      </div>

      <div className="jl-filters">
        <input
          className="jl-input"
          type="text"
          placeholder="Search by title, company, skill…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          className="jl-input"
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select
          className="jl-select"
          value={workType}
          onChange={(e) => setWorkType(e.target.value)}
        >
          <option value="">All work types</option>
          {WORK_TYPES.map((wt) => (
            <option key={wt} value={wt}>
              {wt}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="jl-loading">
          <span className="jl-spinner" aria-hidden="true" />
          <span>Loading jobs…</span>
        </div>
      )}

      {error && !loading && (
        <div className="jl-error" role="alert">
          Could not load jobs — {error}
        </div>
      )}

      {!loading && !error && (
        <div className="jl-grid">
          {results.length > 0 ? (
            results.map((job) => (
              <JobCard
                key={job._id}
                title={job.title}
                company={job.company}
                location={job.location}
                workType={job.workType}
                salary={job.salaryRange ?? null}
                postedDate={formatDate(job.postedAt ?? job.createdAt)}
                skills={job.skills ?? job.requirements ?? []}
                onApply={() =>
                  navigate(`/apply?job=${encodeURIComponent(job.title)}`)
                }
              />
            ))
          ) : (
            <p className="jl-empty">No jobs match your search.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default JobListings;
