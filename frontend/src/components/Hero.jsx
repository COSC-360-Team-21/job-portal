import React from "react";

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

      <style>{`
        .jobboard-hero {
          position: relative;
          overflow: hidden;
          padding: 88px 20px 48px;
          background: linear-gradient(135deg, #07111f 0%, #0b1730 40%, #10224b 100%);
          color: white;
        }

        .jobboard-hero-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 42px 42px;
          opacity: 0.35;
          mask-image: radial-gradient(circle at center, black 45%, transparent 100%);
          pointer-events: none;
        }

        .jobboard-hero-bg-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(90px);
          opacity: 0.35;
          pointer-events: none;
        }

        .jobboard-hero-bg-glow-one {
          width: 340px;
          height: 340px;
          background: #2563eb;
          top: 60px;
          left: -60px;
        }

        .jobboard-hero-bg-glow-two {
          width: 360px;
          height: 360px;
          background: #0ea5e9;
          right: -60px;
          top: 120px;
        }

        .jobboard-hero-container {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 50px;
          align-items: center;
        }

        .jobboard-hero-left {
          max-width: 700px;
        }

        .jobboard-hero-badge-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 22px;
        }

        .jobboard-hero-badge,
        .jobboard-hero-badge-secondary {
          display: inline-flex;
          align-items: center;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 0.88rem;
          font-weight: 700;
          backdrop-filter: blur(10px);
        }

        .jobboard-hero-badge {
          background: rgba(59, 130, 246, 0.16);
          color: #bfdbfe;
          border: 1px solid rgba(147, 197, 253, 0.24);
        }

        .jobboard-hero-badge-secondary {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .jobboard-hero-title {
          margin: 0;
          font-size: clamp(3rem, 6vw, 5.4rem);
          line-height: 1.02;
          letter-spacing: -0.05em;
          font-weight: 850;
        }

        .jobboard-hero-title span {
          display: block;
          color: #93c5fd;
        }

        .jobboard-hero-description {
          margin: 24px 0 0;
          max-width: 650px;
          font-size: 1.08rem;
          line-height: 1.9;
          color: rgba(255, 255, 255, 0.8);
        }

        .jobboard-hero-search-card {
          margin-top: 30px;
          padding: 22px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 50px rgba(2, 6, 23, 0.2);
        }

        .jobboard-hero-search-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 0.9fr auto;
          gap: 14px;
          align-items: end;
        }

        .jobboard-search-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .jobboard-search-field label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.82);
          font-weight: 600;
        }

        .jobboard-search-field input,
        .jobboard-search-field select {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.94);
          color: #0f172a;
          border-radius: 16px;
          padding: 15px 16px;
          font-size: 0.98rem;
          outline: none;
        }

        .jobboard-search-field input::placeholder {
          color: #94a3b8;
        }

        .jobboard-search-btn {
          height: 52px;
          border: none;
          border-radius: 16px;
          padding: 0 22px;
          font-size: 0.98rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.28);
        }

        .jobboard-trending-row {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        .jobboard-trending-label {
          font-size: 0.92rem;
          font-weight: 700;
          color: #bfdbfe;
        }

        .jobboard-trending-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .jobboard-trending-tags span {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.88);
          font-size: 0.88rem;
        }

        .jobboard-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
        }

        .jobboard-hero-primary-btn,
        .jobboard-hero-secondary-btn {
          text-decoration: none;
          padding: 15px 24px;
          border-radius: 16px;
          font-weight: 700;
          transition: all 0.22s ease;
        }

        .jobboard-hero-primary-btn {
          color: white;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.3);
        }

        .jobboard-hero-primary-btn:hover {
          transform: translateY(-2px);
        }

        .jobboard-hero-secondary-btn {
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
        }

        .jobboard-hero-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .jobboard-hero-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 34px;
        }

        .jobboard-stat-card {
          padding: 20px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .jobboard-stat-card h3 {
          margin: 0 0 8px;
          font-size: 1.9rem;
          color: white;
        }

        .jobboard-stat-card p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.72);
        }

        .jobboard-company-strip {
          margin-top: 24px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
        }

        .jobboard-company-strip-label {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.72);
          font-weight: 600;
        }

        .jobboard-company-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .jobboard-company-list span {
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .jobboard-hero-right {
          position: relative;
          min-height: 720px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .jobboard-dashboard-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 540px;
          border-radius: 30px;
          padding: 28px;
          background: rgba(255, 255, 255, 0.95);
          color: #0f172a;
          box-shadow:
            0 30px 80px rgba(2, 6, 23, 0.35),
            0 10px 30px rgba(37, 99, 235, 0.15);
        }

        .jobboard-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .jobboard-mini-label {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 8px;
        }

        .jobboard-mini-label.blue {
          color: #2563eb;
        }

        .jobboard-dashboard-header h3 {
          margin: 0;
          font-size: 1.6rem;
        }

        .jobboard-dashboard-status {
          padding: 10px 14px;
          border-radius: 999px;
          background: #dcfce7;
          color: #15803d;
          font-size: 0.85rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .jobboard-dashboard-summary {
          margin-top: 22px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .jobboard-summary-box {
          padding: 16px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .jobboard-summary-box strong {
          display: block;
          font-size: 1.35rem;
          margin-bottom: 6px;
        }

        .jobboard-summary-box span {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 600;
        }

        .jobboard-featured-role {
          margin-top: 22px;
          padding: 20px;
          border-radius: 22px;
          background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%);
          border: 1px solid #dbeafe;
        }

        .jobboard-featured-role-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .jobboard-featured-role h4 {
          margin: 0 0 6px;
          font-size: 1.35rem;
        }

        .jobboard-featured-role p {
          margin: 0;
          color: #64748b;
          line-height: 1.5;
        }

        .jobboard-match-badge {
          padding: 10px 14px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 0.9rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .jobboard-salary-row {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 0.92rem;
          color: #334155;
          font-weight: 700;
        }

        .jobboard-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .jobboard-skill-tags span {
          padding: 8px 12px;
          border-radius: 999px;
          background: white;
          border: 1px solid #dbeafe;
          color: #2563eb;
          font-size: 0.88rem;
          font-weight: 700;
        }

        .jobboard-progress-block {
          margin-top: 22px;
          padding: 18px;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .jobboard-progress-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 12px;
        }

        .jobboard-progress-bar {
          width: 100%;
          height: 12px;
          border-radius: 999px;
          background: #dbeafe;
          overflow: hidden;
        }

        .jobboard-progress-fill {
          width: 84%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .jobboard-progress-block p {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .jobboard-activity-section {
          margin-top: 22px;
        }

        .jobboard-section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .jobboard-section-head h5 {
          margin: 0;
          font-size: 1rem;
        }

        .jobboard-section-head a {
          color: #2563eb;
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .jobboard-activity-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .jobboard-activity-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .jobboard-activity-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .jobboard-activity-dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          margin-top: 6px;
          flex-shrink: 0;
        }

        .jobboard-activity-item strong {
          display: block;
          margin-bottom: 4px;
          font-size: 0.98rem;
        }

        .jobboard-activity-item p {
          margin: 0;
          color: #64748b;
          font-size: 0.93rem;
          line-height: 1.6;
        }

        .jobboard-insights-row {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .jobboard-insight-card {
          padding: 16px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .jobboard-insight-card span {
          display: block;
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .jobboard-insight-card strong {
          display: block;
          font-size: 1.3rem;
          margin-bottom: 6px;
        }

        .jobboard-insight-card p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .jobboard-floating-card {
          position: absolute;
          z-index: 1;
          max-width: 230px;
          padding: 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(12px);
          box-shadow: 0 14px 30px rgba(2, 6, 23, 0.24);
        }

        .jobboard-floating-card span {
          display: block;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #bfdbfe;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .jobboard-floating-card strong {
          display: block;
          font-size: 1rem;
          margin-bottom: 6px;
          color: white;
        }

        .jobboard-floating-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.74);
          font-size: 0.9rem;
          line-height: 1.55;
        }

        .jobboard-floating-card-one {
          top: 30px;
          left: -20px;
        }

        .jobboard-floating-card-two {
          right: -10px;
          top: 170px;
        }

        .jobboard-floating-card-three {
          left: 0;
          bottom: 40px;
        }

        .jobboard-hero-bottom {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 36px auto 0;
        }

        .jobboard-hero-bottom-card {
          border-radius: 28px;
          padding: 28px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(14px);
        }

        .jobboard-hero-bottom-card h4 {
          margin: 0 0 18px;
          font-size: 1.35rem;
        }

        .jobboard-benefit-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .jobboard-benefit-item {
          padding: 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .jobboard-benefit-item strong {
          display: block;
          margin-bottom: 8px;
          font-size: 1rem;
        }

        .jobboard-benefit-item p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.65;
          font-size: 0.94rem;
        }

        @media (max-width: 1150px) {
          .jobboard-hero-container {
            grid-template-columns: 1fr;
          }

          .jobboard-hero-right {
            min-height: auto;
            margin-top: 10px;
          }

          .jobboard-benefit-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .jobboard-floating-card-one,
          .jobboard-floating-card-two,
          .jobboard-floating-card-three {
            position: static;
            margin-top: 14px;
            max-width: 100%;
          }
        }

        @media (max-width: 900px) {
          .jobboard-hero-search-grid {
            grid-template-columns: 1fr;
          }

          .jobboard-search-btn {
            width: 100%;
          }

          .jobboard-hero-stats {
            grid-template-columns: 1fr;
          }

          .jobboard-dashboard-summary,
          .jobboard-insights-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .jobboard-hero {
            padding: 72px 16px 32px;
          }

          .jobboard-hero-title {
            font-size: 2.6rem;
          }

          .jobboard-hero-actions {
            flex-direction: column;
          }

          .jobboard-hero-primary-btn,
          .jobboard-hero-secondary-btn {
            width: 100%;
            text-align: center;
          }

          .jobboard-company-strip {
            flex-direction: column;
            align-items: flex-start;
          }

          .jobboard-dashboard-header,
          .jobboard-featured-role-top,
          .jobboard-salary-row {
            flex-direction: column;
          }

          .jobboard-benefit-grid {
            grid-template-columns: 1fr;
          }

          .jobboard-dashboard-card,
          .jobboard-hero-search-card,
          .jobboard-hero-bottom-card {
            padding: 20px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;