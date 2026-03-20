import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import JobCard from "./JobCard";
import "./JobSearch.css";

const JobSearch = ({ jobs }) => {
  const [searchValue, setSearchValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const filteredJobs = useMemo(() => {
    const trimmedQuery = submittedQuery.trim().toLowerCase();

    if (!trimmedQuery) {
      return jobs;
    }

    return jobs.filter((job) => {
      return (
        job.title.toLowerCase().includes(trimmedQuery) ||
        job.company.toLowerCase().includes(trimmedQuery) ||
        job.location.toLowerCase().includes(trimmedQuery) ||
        job.workType.toLowerCase().includes(trimmedQuery) ||
        job.skills.some((skill) => skill.toLowerCase().includes(trimmedQuery))
      );
    });
  }, [jobs, submittedQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmittedQuery(searchValue);
    setSearchValue("");
  };

  return (
    <div className="js-wrapper">
      <form className="js-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="js-input"
          placeholder="Search jobs, companies, skills..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <button type="submit" className="js-button">
          Search
        </button>
      </form>

      <div className="js-results-info">
        {submittedQuery.trim() ? (
          <p>
            Results for <strong>"{submittedQuery}"</strong>
          </p>
        ) : (
          <p>Showing all jobs</p>
        )}
      </div>

      {filteredJobs.length === 0 ? (
        <p className="js-no-results">No results found</p>
      ) : (
        <div className="jl-grid">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              workType={job.workType}
              salary={job.salary}
              postedDate={job.postedDate}
              skills={job.skills}
              onApply={() => alert(`Applying for ${job.title} at ${job.company}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

JobSearch.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      workType: PropTypes.string.isRequired,
      salary: PropTypes.string,
      postedDate: PropTypes.string,
      skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
};

export default JobSearch;