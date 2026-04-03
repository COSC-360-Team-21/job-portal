import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import JobCard from "../components/JobCard";
import "./JobSearch.css";

const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const JobSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inputValue, setInputValue] = useState(initialQ);
  const [workType, setWorkType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWorkType, setActiveWorkType] = useState("");
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch total count on mount + auto-search if query param present
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/jobs?limit=1");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        setTotalJobs(json.pagination?.totalItems ?? 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

      // Auto-search if query param is present
      if (initialQ) {
        setSearching(true);
        setSubmitted(true);
        setSearchTerm(initialQ);
        setInputValue("");
        try {
          const params = new URLSearchParams();
          params.set("q", initialQ);
          params.set("limit", "100");
          const res = await fetch(`/api/jobs?${params}`);
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          const json = await res.json();
          setResults(json.data ?? []);
          setTotalResults(json.pagination?.totalItems ?? 0);
        } catch (err) {
          setError(err.message);
        } finally {
          setSearching(false);
        }
      }
    };
    init();
  }, [initialQ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const term = inputValue.trim();
    setSearchTerm(term);
    setActiveWorkType(workType);
    setSubmitted(true);
    setInputValue("");
    setError(null);
    setSearching(true);

    try {
      const params = new URLSearchParams();
      if (term) params.set("q", term);
      if (workType) params.set("workType", workType);
      params.set("limit", "100");

      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setResults(json.data ?? []);
      setTotalResults(json.pagination?.totalItems ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="jsearch-page">
      {/* Hero / Search Bar  */}
      <div className="jsearch-hero">
        <div className="jsearch-hero-glow jsearch-hero-glow--left" aria-hidden="true" />
        <div className="jsearch-hero-glow jsearch-hero-glow--right" aria-hidden="true" />

        <div className="jsearch-hero-content">
          <h1 className="jsearch-title">Find Your Next Role</h1>
          <p className="jsearch-subtitle">
            Search jobs by title, company, keyword, or skill
          </p>

          <form className="jsearch-form" onSubmit={handleSubmit} noValidate>
            <div className="jsearch-input-wrap">
              <svg
                className="jsearch-icon"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M13.5 13.5L17 17"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              <input
                className="jsearch-input"
                type="text"
                placeholder="Job title, company, or keyword…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                aria-label="Search jobs"
              />
            </div>

            <select
              className="jsearch-select"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              aria-label="Filter by work type"
            >
              <option value="">All work types</option>
              {WORK_TYPES.map((wt) => (
                <option key={wt} value={wt}>
                  {wt}
                </option>
              ))}
            </select>

            <button className="jsearch-btn" type="submit" disabled={loading || searching}>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M13.5 13.5L17 17"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              Search Jobs
            </button>
          </form>
        </div>
      </div>

      {/*  Body  */}
      <div className="jsearch-body">
        {/* Loading */}
        {(loading || searching) && (
          <div className="jsearch-status">
            <span className="jsearch-spinner" aria-hidden="true" />
            <span>Loading jobs…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && !searching && (
          <div className="jsearch-error" role="alert">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" />
              <path d="M10 6v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <circle cx="10" cy="13.5" r="0.75" fill="currentColor" />
            </svg>
            <p>Could not load jobs — {error}</p>
          </div>
        )}

        {/* Prompt (before first search) */}
        {!loading && !searching && !error && !submitted && (
          <div className="jsearch-prompt">
            <div className="jsearch-prompt-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="28" cy="28" r="19" stroke="#bfdbfe" strokeWidth="3" />
                <path
                  d="M43 43l10 10"
                  stroke="#bfdbfe"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M21 28h14M28 21v14"
                  stroke="#93c5fd"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="jsearch-prompt-text">
              Enter a keyword above and hit <strong>Search Jobs</strong> to get started.
            </p>
            <p className="jsearch-prompt-hint">
              {totalJobs > 0 ? `${totalJobs} jobs available` : ""}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !searching && !error && submitted && (
          <>
            <div className="jsearch-results-header">
              {totalResults > 0 ? (
                <>
                  <span className="jsearch-results-count">
                    {totalResults} result{totalResults !== 1 ? "s" : ""}
                  </span>
                  {(searchTerm || activeWorkType) && (
                    <span className="jsearch-results-for">
                      for{" "}
                      {[
                        searchTerm && <strong key="term">&quot;{searchTerm}&quot;</strong>,
                        activeWorkType && (
                          <span key="wt" className="jsearch-results-badge">
                            {activeWorkType}
                          </span>
                        ),
                      ].filter(Boolean).reduce((acc, el, i) => (i === 0 ? [el] : [...acc, " · ", el]), [])}
                    </span>
                  )}
                </>
              ) : null}
            </div>

            {results.length > 0 ? (
              <div className="jsearch-grid">
                {results.map((job) => (
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
                      navigate(`/apply?job=${encodeURIComponent(job.title)}&jobId=${job._id}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="jsearch-empty">
                <div className="jsearch-empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 80 80" fill="none">
                    <circle cx="34" cy="34" r="22" stroke="#e2e8f0" strokeWidth="3.5" />
                    <path
                      d="M51 51l14 14"
                      stroke="#e2e8f0"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M26 34h16"
                      stroke="#cbd5e1"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h2 className="jsearch-empty-title">No results found</h2>
                <p className="jsearch-empty-text">
                  No jobs matched{" "}
                  {searchTerm ? <strong>&quot;{searchTerm}&quot;</strong> : "your search"}.
                  <br />
                  Try different keywords or remove the work type filter.
                </p>
                <button
                  className="jsearch-empty-reset"
                  onClick={() => {
                    setSubmitted(false);
                    setSearchTerm("");
                    setActiveWorkType("");
                    setWorkType("");
                  }}
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
