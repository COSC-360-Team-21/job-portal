import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      heading: "Company",
      links: [
        { label: "About Us", to: "/about" },
        { label: "Careers", to: "/careers" },
        { label: "Blog", to: "/blog" },
        { label: "Press", to: "/press" },
      ],
    },
    {
      heading: "For Job Seekers",
      links: [
        { label: "Browse Jobs", to: "/jobs" },
        { label: "Browse Industries", to: "/industries" },
        { label: "Saved Jobs", to: "/saved" },
        { label: "Career Resources", to: "/resources" },
      ],
    },
    {
      heading: "For Employers",
      links: [
        { label: "Post a Job", to: "/post-job" },
        { label: "Browse Candidates", to: "/candidates" },
        { label: "Pricing", to: "/pricing" },
        { label: "Employer FAQ", to: "/faq" },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Help Center", to: "/help" },
        { label: "Contact Us", to: "/contact" },
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
      ],
    },
  ];

  return (
    <footer className="jb-footer">
      <div className="jb-footer-inner">
        {/* Top row: brand + columns */}
        <div className="jb-footer-top">
          {/* Brand blurb */}
          <div className="jb-footer-brand">
            <Link to="/" className="jb-footer-logo">
              <span className="jb-footer-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </span>
              <span>JobBoard</span>
            </Link>
            <p className="jb-footer-tagline">
              Connecting talented people with great companies. Your next opportunity starts here.
            </p>
            {/* Social icons */}
            <div className="jb-footer-social">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="jb-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="jb-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="jb-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="jb-footer-columns">
            {columns.map((col) => (
              <div key={col.heading} className="jb-footer-col">
                <h4 className="jb-footer-col-heading">{col.heading}</h4>
                <ul className="jb-footer-col-links">
                  {col.links.map(({ label, to }) => (
                    <li key={to}>
                      <Link to={to} className="jb-footer-link">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="jb-footer-bottom">
          <p className="jb-footer-copy">
            © {currentYear} JobBoard. All rights reserved.
          </p>
          <div className="jb-footer-bottom-links">
            <Link to="/privacy" className="jb-footer-link">Privacy</Link>
            <Link to="/terms" className="jb-footer-link">Terms</Link>
            <Link to="/cookies" className="jb-footer-link">Cookies</Link>
          </div>
        </div>
      </div>

      <style>{`
        .jb-footer {
          background: #0f172a;
          color: #94a3b8;
          margin-top: auto;
        }

        .jb-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 24px 28px;
        }

        /* Top layout */
        .jb-footer-top {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 48px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        /* Brand */
        .jb-footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #f8fafc;
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }

        .jb-footer-logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 9px;
          color: white;
          flex-shrink: 0;
        }

        .jb-footer-tagline {
          font-size: 0.92rem;
          line-height: 1.7;
          color: #64748b;
          margin: 0 0 20px;
          max-width: 240px;
        }

        /* Social */
        .jb-footer-social {
          display: flex;
          gap: 10px;
        }

        .jb-social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255,255,255,0.06);
          color: #94a3b8;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }

        .jb-social-btn:hover {
          background: #2563eb;
          color: white;
        }

        /* Columns */
        .jb-footer-columns {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .jb-footer-col-heading {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #e2e8f0;
          margin: 0 0 16px;
        }

        .jb-footer-col-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .jb-footer-link {
          font-size: 0.92rem;
          color: #64748b;
          text-decoration: none;
          transition: color 0.15s;
        }

        .jb-footer-link:hover {
          color: #93c5fd;
        }

        /* Bottom bar */
        .jb-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 24px;
          gap: 16px;
        }

        .jb-footer-copy {
          margin: 0;
          font-size: 0.88rem;
          color: #475569;
        }

        .jb-footer-bottom-links {
          display: flex;
          gap: 20px;
        }


      `}</style>
    </footer>
  );
};

export default Footer;
