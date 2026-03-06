import React, { useState } from "react";
import "./LoginForm.css";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <section className="jobboard-login-section">
      <div className="jobboard-login-card">
        <div className="jobboard-login-header">
          <span className="jobboard-login-badge">Welcome Back</span>
          <h1>Login to JobBoard</h1>
          <p>
            Access your account to manage applications, track saved jobs, and
            continue building your career journey.
          </p>
        </div>

        <form className="jobboard-login-form">
          <div className="jobboard-form-group">
            <label htmlFor="email">Email</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">✉</span>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="jobboard-form-group">
            <div className="jobboard-label-row">
              <label htmlFor="password">Password</label>
              <a href="/forgot-password" className="jobboard-forgot-link">
                Forgot password?
              </a>
            </div>

            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="jobboard-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="jobboard-login-options">
            <label className="jobboard-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((prev) => !prev)}
              />
              <span>Remember me</span>
            </label>

            <span className="jobboard-secure-note">Secure login</span>
          </div>

          <button type="submit" className="jobboard-primary-btn">
            Continue
          </button>

          <button type="button" className="jobboard-secondary-btn">
            Continue as Guest
          </button>

          <div className="jobboard-divider">
            <span>or</span>
          </div>

          <div className="jobboard-social-login">
            <button type="button" className="jobboard-social-btn">
              <span>G</span>
              Continue with Google
            </button>
            <button type="button" className="jobboard-social-btn">
              <span>in</span>
              Continue with LinkedIn
            </button>
          </div>

          <p className="jobboard-signup-text">
            Don&apos;t have an account?{" "}
            <a href="/signup">Sign up here</a>
          </p>
        </form>
      </div>

    </section>
  );
};

export default LoginForm;