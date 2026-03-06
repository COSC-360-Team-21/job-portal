import JobCard from "../components/JobCard";
import "./JobListings.css";

const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "NovaTech",
    location: "Toronto, ON",
    workType: "Full-Time",
    salary: "$78,000 – $96,000",
    postedDate: "2 days ago",
    skills: ["React", "TypeScript", "UI Systems"],
  },
  {
    id: 2,
    title: "UX Designer",
    company: "BrightLabs",
    location: "Remote",
    workType: "Full-Time",
    salary: "$70,000 – $88,000",
    postedDate: "1 day ago",
    skills: ["Figma", "User Research", "Prototyping"],
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "CloudPeak",
    location: "Vancouver, BC",
    workType: "Contract",
    salary: "$55 – $70 / hr",
    postedDate: "3 days ago",
    skills: ["Python", "SQL", "Tableau"],
  },
  {
    id: 4,
    title: "Marketing Coordinator",
    company: "Vertex",
    location: "Calgary, AB",
    workType: "Part-Time",
    salary: "$42,000 – $52,000",
    postedDate: "5 days ago",
    skills: ["Content Strategy", "SEO", "Analytics"],
  },
  {
    id: 5,
    title: "Project Manager",
    company: "NorthGrid",
    location: "Remote",
    workType: "Full-Time",
    salary: "$90,000 – $110,000",
    postedDate: "Today",
    skills: ["Agile", "Jira", "Stakeholder Management"],
  },
  {
    id: 6,
    title: "Backend Engineer",
    company: "CloudPeak",
    location: "Ottawa, ON",
    workType: "Full-Time",
    salary: "$85,000 – $105,000",
    postedDate: "4 days ago",
    skills: ["Node.js", "MongoDB", "REST APIs"],
  },
];

const JobListings = () => {
  return (
    <section className="jl-page">
      <div className="jl-header">
        <h1 className="jl-title">Browse Jobs</h1>
        <p className="jl-subtitle">
          {SAMPLE_JOBS.length} opportunities available right now
        </p>
      </div>

      <div className="jl-grid">
        {SAMPLE_JOBS.map((job) => (
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

    </section>
  );
};

export default JobListings;
