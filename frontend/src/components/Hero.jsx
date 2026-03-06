import React from "react";
import "./Hero.css";

const Hero = () => {
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
            JobBoard helps candidates discover the right opportunities faster with
            smart matching, clean application tracking, skill-based recommendations,
            and a better hiring experience from start to finish.
          </p>

          <div className="jobboard-hero-search-card">
            <div className="jobboard-hero-search-grid">
              <div className="jobboard-search-field">
                <label>Job title or keyword</label>
                <input type="text" placeholder="Frontend Developer, Designer, Marketing..." />
              </div>

              <div className="jobboard-search-field">
                <label>Location</label>
                <input type="text" placeholder="Toronto, Vancouver, Remote..." />
              </div>

              <div className="jobboard-search-field">
                <label>Work type</label>
                <select defaultValue="">
                  <option value="" disabled>
                    Select type
                  </option>
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                  <option>Remote</option>
                </select>
              </div>

              <button className="jobboard-search-btn">Search Jobs</button>
            </div>

            <div className="jobboard-trending-row">
              <span className="jobboard-trending-label">Trending:</span>
              <div className="jobboard-trending-tags">
                <span>Software Engineer</span>
                <span>Data Analyst</span>
                <span>UX Designer</span>
                <span>Marketing Coordinator</span>
                <span>Project Manager</span>
              </div>
            </div>
          </div>

          <div className="jobboard-hero-actions">
            <a href="/jobs" className="jobboard-hero-primary-btn">
              Explore Jobs
            </a>
            <a href="/signup" className="jobboard-hero-secondary-btn">
              Create Free Account
            </a>
          </div>

          <div className="jobboard-hero-stats">
            <div className="jobboard-stat-card">
              <h3>25k+</h3>
              <p>Active job opportunities across industries</p>
            </div>
            <div className="jobboard-stat-card">
              <h3>4.8/5</h3>
              <p>Candidate experience rating from platform users</p>
            </div>
            <div className="jobboard-stat-card">
              <h3>3,500+</h3>
              <p>Employers hiring through JobBoard every month</p>
            </div>
          </div>

          <div className="jobboard-company-strip">
            <span className="jobboard-company-strip-label">Companies hiring here:</span>
            <div className="jobboard-company-list">
              <span>NovaTech</span>
              <span>CloudPeak</span>
              <span>BrightLabs</span>
              <span>Vertex</span>
              <span>NorthGrid</span>
            </div>
          </div>
        </div>

        <div className="jobboard-hero-right">
          <div className="jobboard-dashboard-card">
            <div className="jobboard-dashboard-header">
              <div>
                <span className="jobboard-mini-label">Candidate Dashboard</span>
                <h3>Your opportunities at a glance</h3>
              </div>
              <span className="jobboard-dashboard-status">Live</span>
            </div>

            <div className="jobboard-dashboard-summary">
              <div className="jobboard-summary-box">
                <strong>18</strong>
                <span>Saved Jobs</span>
              </div>
              <div className="jobboard-summary-box">
                <strong>07</strong>
                <span>Applications</span>
              </div>
              <div className="jobboard-summary-box">
                <strong>03</strong>
                <span>Interviews</span>
              </div>
            </div>

            <div className="jobboard-featured-role">
              <div className="jobboard-featured-role-top">
                <div>
                  <span className="jobboard-mini-label blue">Recommended for You</span>
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
                <span>React</span>
                <span>JavaScript</span>
                <span>TypeScript</span>
                <span>UI Systems</span>
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
                <div className="jobboard-activity-item">
                  <div className="jobboard-activity-dot" />
                  <div>
                    <strong>Interview invite received</strong>
                    <p>Product Designer role at BrightLabs</p>
                  </div>
                </div>

                <div className="jobboard-activity-item">
                  <div className="jobboard-activity-dot" />
                  <div>
                    <strong>Resume score improved</strong>
                    <p>Your profile is now stronger for recruiter search</p>
                  </div>
                </div>

                <div className="jobboard-activity-item">
                  <div className="jobboard-activity-dot" />
                  <div>
                    <strong>New matching roles added</strong>
                    <p>5 jobs match your selected skills and preferences</p>
                  </div>
                </div>
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

          <div className="jobboard-floating-card jobboard-floating-card-one">
            <span>Top Employer</span>
            <strong>Hiring Surge</strong>
            <p>120+ open roles in engineering, product, and operations</p>
          </div>

          <div className="jobboard-floating-card jobboard-floating-card-two">
            <span>Smart Matching</span>
            <strong>Skill-based recommendations</strong>
            <p>Find more relevant roles with less searching</p>
          </div>

          <div className="jobboard-floating-card jobboard-floating-card-three">
            <span>Application Tracker</span>
            <strong>Stay organized</strong>
            <p>Monitor interview stages, saved jobs, and recruiter updates</p>
          </div>
        </div>
      </div>

      <div className="jobboard-hero-bottom">
        <div className="jobboard-hero-bottom-card">
          <h4>Why candidates choose JobBoard</h4>
          <div className="jobboard-benefit-grid">
            <div className="jobboard-benefit-item">
              <strong>Smarter Discovery</strong>
              <p>Search less and discover better-fit opportunities faster.</p>
            </div>
            <div className="jobboard-benefit-item">
              <strong>Cleaner Applications</strong>
              <p>Track your progress clearly from applied to interview stage.</p>
            </div>
            <div className="jobboard-benefit-item">
              <strong>Better Visibility</strong>
              <p>Optimize profiles and resumes for stronger recruiter reach.</p>
            </div>
            <div className="jobboard-benefit-item">
              <strong>All in One Place</strong>
              <p>Jobs, employers, saved roles, and updates in one dashboard.</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;