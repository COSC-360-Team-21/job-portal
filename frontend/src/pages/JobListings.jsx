import { useMemo, useState } from "react";
import JobCard from "../components/JobCard";
import "./JobListings.css";

const JOBS = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    workType: "Full-time",
    workMode: "Remote",
    experienceLevel: "Senior Level",
    industry: "Technology",
    postedDate: "2 days ago",
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "Creative Studios Inc",
    location: "New York, NY",
    workType: "Full-time",
    workMode: "On-site",
    experienceLevel: "Mid Level",
    industry: "Design",
    postedDate: "3 days ago",
  },
  {
    id: 3,
    title: "Marketing Intern",
    company: "Growth Marketing Co",
    location: "Austin, TX",
    workType: "Internship",
    workMode: "Remote",
    experienceLevel: "Entry Level",
    industry: "Marketing",
    postedDate: "1 day ago",
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "Analytics Plus",
    location: "Seattle, WA",
    workType: "Full-time",
    workMode: "Hybrid",
    experienceLevel: "Mid Level",
    industry: "Technology",
    postedDate: "4 days ago",
  },
  {
    id: 5,
    title: "Financial Analyst",
    company: "MoneyWise Capital",
    location: "Chicago, IL",
    workType: "Contract",
    workMode: "On-site",
    experienceLevel: "Mid Level",
    industry: "Finance",
    postedDate: "2 days ago",
  },
  {
    id: 6,
    title: "Healthcare Coordinator",
    company: "CareBridge Health",
    location: "Boston, MA",
    workType: "Part-time",
    workMode: "On-site",
    experienceLevel: "Entry Level",
    industry: "Healthcare",
    postedDate: "6 days ago",
  },
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Marketing",
  "Design",
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level"];

const WORK_MODES = ["Remote", "On-site", "Hybrid"];

const JobListings = () => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState([]);

  const toggleFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();

    return JOBS.filter((job) => {
      const matchesSearch =
        normalizedSearch === "" ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.company.toLowerCase().includes(normalizedSearch) ||
        job.industry.toLowerCase().includes(normalizedSearch) ||
        job.workType.toLowerCase().includes(normalizedSearch) ||
        job.workMode.toLowerCase().includes(normalizedSearch);

      const matchesLocation =
        normalizedLocation === "" ||
        job.location.toLowerCase().includes(normalizedLocation);

      const matchesIndustry =
        selectedIndustries.length === 0 ||
        selectedIndustries.includes(job.industry);

      const matchesJobType =
        selectedJobTypes.length === 0 ||
        selectedJobTypes.includes(job.workType);

      const matchesExperience =
        selectedExperienceLevels.length === 0 ||
        selectedExperienceLevels.includes(job.experienceLevel);

      const matchesWorkMode =
        selectedWorkModes.length === 0 ||
        selectedWorkModes.includes(job.workMode);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesIndustry &&
        matchesJobType &&
        matchesExperience &&
        matchesWorkMode
      );
    });
  }, [
    search,
    location,
    selectedIndustries,
    selectedJobTypes,
    selectedExperienceLevels,
    selectedWorkModes,
  ]);

  return (
    <div className="page">
      <div className="container">
       

        <div className="search-row">
          <input
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="sort-row">
          <span>Sort by:</span>
          <select defaultValue="Relevance">
            <option>Relevance</option>
            <option>Date</option>
          </select>
        </div>

        <div className="main">
          <div className="sidebar">
            <h4>Industry</h4>
            {INDUSTRIES.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={selectedIndustries.includes(item)}
                  onChange={() => toggleFilter(item, setSelectedIndustries)}
                />
                {" "}
                {item}
              </label>
            ))}

            <h4>Job Type</h4>
            {JOB_TYPES.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={selectedJobTypes.includes(item)}
                  onChange={() => toggleFilter(item, setSelectedJobTypes)}
                />
                {" "}
                {item}
              </label>
            ))}

            <h4>Experience Level</h4>
            {EXPERIENCE_LEVELS.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={selectedExperienceLevels.includes(item)}
                  onChange={() =>
                    toggleFilter(item, setSelectedExperienceLevels)
                  }
                />
                {" "}
                {item}
              </label>
            ))}

            <h4>Work Mode</h4>
            {WORK_MODES.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={selectedWorkModes.includes(item)}
                  onChange={() => toggleFilter(item, setSelectedWorkModes)}
                />
                {" "}
                {item}
              </label>
            ))}
          </div>

          <div className="results">
            <p>Showing {filteredJobs.length} jobs</p>

            {filteredJobs.length === 0 ? (
              <div className="no-results">No results found</div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  workType={job.workType}
                  workMode={job.workMode}
                  postedDate={job.postedDate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListings;