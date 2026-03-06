import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const navLinks = [
    { label: "Jobs", to: "/jobs" },
    { label: "Industries", to: "/industries" },
    { label: "Register", to: "/register" },
  ];

  return (
    <header className="jb-header">
      <div className="jb-header-inner">
        {/* Logo */}
        <Link to="/" className="jb-logo">
          <span className="jb-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </span>
          <span className="jb-logo-text">JobBoard</span>
        </Link>

        {/* Nav */}
        <nav className="jb-nav">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`jb-nav-link${location.pathname === to ? " jb-nav-link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Login button */}
        <div className="jb-header-actions">
          <Link to="/login" className="jb-login-btn">
            Login
          </Link>
        </div>
      </div>

      <style>{`
        .jb-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06);
        }

        .jb-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 32px;
        }

        /* Logo */
        .jb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .jb-logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 10px;
          color: white;
        }

        .jb-logo-text {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        /* Nav */
        .jb-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .jb-nav-link {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }

        .jb-nav-link:hover,
        .jb-nav-link--active {
          background: #eff6ff;
          color: #2563eb;
        }

        /* Actions */
        .jb-header-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .jb-login-btn {
          padding: 9px 22px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .jb-login-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>
    </header>
  );
};

export default Header;
