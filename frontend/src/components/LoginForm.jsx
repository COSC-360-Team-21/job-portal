import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

        <form className="jobboard-login-form" onSubmit={handleSubmit}>
          {error && <p className="jobboard-error">{error}</p>}

          <div className="jobboard-form-group">
            <label htmlFor="email">Email</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">✉</span>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          <button type="submit" className="jobboard-primary-btn" disabled={loading}>
            {loading ? "Signing in…" : "Continue"}
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
            <Link to="/register">Sign up here</Link>
          </p>
        </form>
      </div>

    </section>
  );
};

export default LoginForm;