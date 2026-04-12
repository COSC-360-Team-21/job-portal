import { useNavigate } from "react-router-dom";
import "./Hero.css";

const trendingJobs = [
  "Software Engineer",
  "Data Analyst",
  "UX Designer",
  "Marketing Coordinator",
  "Project Manager",
  "Product Manager",
  "Business Analyst",
  "Customer Success",
];

const stats = [
  { value: "25k+", label: "Active opportunities" },
  { value: "4.8/5", label: "Candidate satisfaction" },
  { value: "3,500+", label: "Employers hiring monthly" },
];

const dashboardSummary = [
  { value: "18", label: "Saved Jobs" },
  { value: "07", label: "Applications" },
  { value: "03", label: "Interviews" },
];

const skills = ["React", "JavaScript", "TypeScript", "UI Systems"];

const recentActivity = [
  {
    title: "Interview invite received",
    text: "Product Designer role at BrightLabs",
  },
  {
    title: "Resume score improved",
    text: "Your profile is now stronger for recruiter search",
  },
  {
    title: "New matching roles added",
    text: "5 jobs match your selected skills and preferences",
  },
];

export default function Hero() {
  const navigate = useNavigate();

  const handleTrending = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="jobboard-hero">
      <div className="jobboard-hero-bg-grid" />
      <div className="jobboard-hero-bg-glow jobboard-hero-bg-glow-one" />
      <div className="jobboard-hero-bg-glow jobboard-hero-bg-glow-two" />

      <div className="jobboard-hero-container">
        <div className="jobboard-hero-left">
          <div className="jobboard-hero-badge-wrap">
            <span className="jobboard-hero-badge">AI-Powered Career Platform</span>
            <span className="jobboard-hero-badge-secondary">
              Trusted by job seekers and employers
            </span>
          </div>

          <h1 className="jobboard-hero-title">
            Find meaningful work,
            <span> connect with top employers,</span>
            <span> and move your career forward.</span>
          </h1>

          <p className="jobboard-hero-description">
            Discover better-fit opportunities faster with smart matching,
            clean application tracking, personalized recommendations,
            and a hiring experience designed to feel modern from start to finish.
          </p>

          <div className="jobboard-hero-actions">
            <a href="/jobs" className="jobboard-hero-primary-btn">
              Explore Jobs
            </a>
            <a href="/register" className="jobboard-hero-secondary-btn">
              Create Free Account
            </a>
          </div>

          <div className="jobboard-trending-panel">
            <div className="jobboard-trending-top">
              <div>
                <span className="jobboard-trending-eyebrow">Popular searches</span>
                <h3>Trending jobs</h3>
                <p>
                  Explore the roles candidates are searching for most right now
                  across tech, design, analytics, business, and operations.
                </p>
              </div>

              <div className="jobboard-trending-pill">
                <span className="jobboard-trending-pill-dot" />
                Updated daily
              </div>
            </div>

            <div className="jobboard-trending-tags">
              {trendingJobs.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="jobboard-trending-chip"
                  onClick={() => handleTrending(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="jobboard-trending-insights">
              <div className="jobboard-trending-card">
                <span className="jobboard-trending-card-label">Most searched</span>
                <strong>Frontend and data roles</strong>
                <p>
                  Strong interest continues around remote-friendly engineering
                  and analytics positions.
                </p>
              </div>

              <div className="jobboard-trending-card">
                <span className="jobboard-trending-card-label">Fast-growing</span>
                <strong>Product and operations</strong>
                <p>
                  Employers are expanding hiring for coordination and
                  cross-functional execution roles.
                </p>
              </div>

              <div className="jobboard-trending-card">
                <span className="jobboard-trending-card-label">Best entry point</span>
                <strong>Junior and coordinator jobs</strong>
                <p>
                  Great options for students, new grads, and early-career
                  applicants building experience.
                </p>
              </div>
            </div>
          </div>

          <div className="jobboard-hero-stats">
            {stats.map((stat) => (
              <div key={stat.value} className="jobboard-stat-card">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="jobboard-hero-right">
          <div className="jobboard-orbit jobboard-orbit-one" />
          <div className="jobboard-orbit jobboard-orbit-two" />

          <div className="jobboard-dashboard-card">
            <div className="jobboard-dashboard-header">
              <div>
                <span className="jobboard-mini-label">Candidate Dashboard</span>
                <h3>Your opportunities at a glance</h3>
              </div>
              <span className="jobboard-dashboard-status">Live</span>
            </div>

            <div className="jobboard-dashboard-summary">
              {dashboardSummary.map((item) => (
                <div key={item.label} className="jobboard-summary-box">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="jobboard-featured-role">
              <div className="jobboard-featured-role-top">
                <div>
                  <span className="jobboard-mini-label blue">Recommended for you</span>
                  <h4>Frontend Developer</h4>
                  <p>Remote • Full-Time • Toronto, ON</p>
                </div>
                <span className="jobboard-match-badge">92% Match</span>
              </div>

              <div className="jobboard-salary-row">
                <span>$78,000 - $96,000</span>
                <span>Posted 2 days ago</span>
              </div>

              <div className="jobboard-skill-tags">
                {skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="jobboard-progress-block">
              <div className="jobboard-progress-header">
                <span>Profile Completion</span>
                <span>84%</span>
              </div>
              <div className="jobboard-progress-bar">
                <div className="jobboard-progress-fill" />
              </div>
              <p>Complete your profile to improve visibility to recruiters.</p>
            </div>

            <div className="jobboard-activity-section">
              <div className="jobboard-section-head">
                <h5>Recent activity</h5>
                <a href="/dashboard">View all</a>
              </div>

              <div className="jobboard-activity-list">
                {recentActivity.map((item) => (
                  <div key={item.title} className="jobboard-activity-item">
                    <div className="jobboard-activity-dot" />
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="jobboard-insights-row">
              <div className="jobboard-insight-card">
                <span>Recruiter interest</span>
                <strong>+26%</strong>
                <p>Profile views this week</p>
              </div>

              <div className="jobboard-insight-card">
                <span>Best fit roles</span>
                <strong>12</strong>
                <p>Recommended today</p>
              </div>
            </div>
          </div>

          <div className="jobboard-side-note jobboard-side-note-top">
            <span>Smart matching</span>
            <strong>Better role discovery</strong>
            <p>Find relevant jobs faster with cleaner signals and better recommendations.</p>
          </div>

          <div className="jobboard-side-note jobboard-side-note-bottom">
            <span>Application clarity</span>
            <strong>Track every step</strong>
            <p>Stay organized across saved jobs, interviews, and recruiter updates.</p>
          </div>
        </div>
      </div>
    </section>
  );
}