import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

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

    </header>
  );
};

export default Header;
