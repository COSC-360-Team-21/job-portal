import { useState, useMemo } from "react";
import JobCard from "../components/JobCard";
import allJobs from "../data/jobs.json";
import "./JobListings.css";

const formatSalary = ({ min, max, currency, period }) => {
  const fmt = (n) =>
    period === "hourly" ? `$${n}` : `$${n.toLocaleString()}`;
  const suffix = period === "hourly" ? " / hr" : "";
  return `${fmt(min)} – ${fmt(max)} ${currency}${suffix}`;
};

const matches = (value, term) =>
  String(value).toLowerCase().includes(term.toLowerCase());

const JobListings = () => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState("");

  const results = useMemo(() => {
    return allJobs.filter((job) => {
      if (query.trim()) {
        const term = query.trim();
        const inTitle = matches(job.title, term);
        const inCompany = matches(job.company, term);
        const inDescription = matches(job.description, term);
        const inSkills = job.skills.some((s) => matches(s, term));
        if (!inTitle && !inCompany && !inDescription && !inSkills) return false;
      }
      if (location.trim() && !matches(job.location, location.trim())) return false;
      if (workType && job.workType !== workType) return false;
      return true;
    });
  }, [query, location, workType]);

  const workTypes = [...new Set(allJobs.map((j) => j.workType))];

  return (
    <section className="jl-page">
      <div className="jl-header">
        <h1 className="jl-title">Browse Jobs</h1>
        <p className="jl-subtitle">{results.length} opportunities available</p>
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
          {workTypes.map((wt) => (
            <option key={wt} value={wt}>{wt}</option>
          ))}
        </select>
      </div>

      <div className="jl-grid">
        {results.length > 0 ? (
          results.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              workType={job.workType}
              salary={formatSalary(job.salary)}
              postedDate={job.postedDate}
              skills={job.skills}
              onApply={() => alert(`Applying for ${job.title} at ${job.company}`)}
            />
          ))
        ) : (
          <p className="jl-empty">No jobs match your search.</p>
        )}
      </div>
    </section>
  );
};

export default JobListings;
