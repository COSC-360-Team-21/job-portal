import React, { useState } from "react";

const SignUp = () => {
  const [role, setRole] = useState("seeker");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="jobboard-login-section">
      <div className="jobboard-login-card">
        <div className="jobboard-login-header">
          <span className="jobboard-login-badge">Get Started</span>
          <h1>Create your account</h1>
          <p>
            Join JobBoard to manage applications, track saved jobs, and
            move your career forward.
          </p>
        </div>

        <form className="jobboard-login-form" onSubmit={(e) => e.preventDefault()}>
          {/* Role Selection */}
          <div className="jobboard-form-group">
            <label>I want to sign up as</label>
            <div className="jobboard-role-toggle">
              <button
                type="button"
                className={`jobboard-role-btn ${role === "seeker" ? "active" : ""}`}
                onClick={() => setRole("seeker")}
              >
                Job Seeker
              </button>
              <button
                type="button"
                className={`jobboard-role-btn ${role === "employer" ? "active" : ""}`}
                onClick={() => setRole("employer")}
              >
                Employer
              </button>
            </div>
          </div>

          <div className="jobboard-form-group">
            <label htmlFor="name">Full Name</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">👤</span>
              <input id="name" type="text" placeholder="Enter your full name" />
            </div>
          </div>

          <div className="jobboard-form-group">
            <label htmlFor="email">Email</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">✉</span>
              <input id="email" type="email" placeholder="name@company.com" />
            </div>
          </div>

          <div className="jobboard-form-group">
            <label htmlFor="password">Password</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="jobboard-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="jobboard-login-options">
            <label className="jobboard-checkbox">
              <input type="checkbox" />
              <span>I agree to the Terms & Conditions</span>
            </label>
            <span className="jobboard-secure-note">Secure Sign Up</span>
          </div>

          <button type="submit" className="jobboard-primary-btn">
            Create Account
          </button>

          <div className="jobboard-divider">
            <span>or</span>
          </div>

          <div className="jobboard-social-login">
            <button type="button" className="jobboard-social-btn">
              <span>G</span> Continue with Google
            </button>
            <button type="button" className="jobboard-social-btn">
              <span>in</span> Continue with LinkedIn
            </button>
          </div>

          <p className="jobboard-signup-text">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </form>
      </div>

      <style>{`
        /* Inheriting same base styles from your LoginForm */
        .jobboard-login-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 28%),
            radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.12), transparent 30%),
            linear-gradient(135deg, #f8fafc 0%, #eef4ff 50%, #f8fafc 100%);
        }

        .jobboard-login-card {
          width: 100%;
          max-width: 560px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(37, 99, 235, 0.08);
        }

        .jobboard-login-header { margin-bottom: 28px; }
        .jobboard-login-badge {
          display: inline-block; padding: 8px 14px; border-radius: 999px;
          background: rgba(37, 99, 235, 0.1); color: #2563eb; font-size: 0.85rem; font-weight: 700; margin-bottom: 16px;
        }

        .jobboard-login-header h1 {
          margin: 0 0 12px; font-size: clamp(2.1rem, 4vw, 3rem); line-height: 1.1; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;
        }

        .jobboard-login-header p { margin: 0; color: #475569; font-size: 1rem; line-height: 1.7; }
        .jobboard-login-form { display: flex; flex-direction: column; gap: 20px; }
        .jobboard-form-group { display: flex; flex-direction: column; gap: 10px; }
        .jobboard-form-group label { font-size: 0.98rem; font-weight: 600; color: #1e293b; }

        /* Role Toggle Specific Styles */
        .jobboard-role-toggle { display: flex; gap: 12px; }
        .jobboard-role-btn {
          flex: 1; padding: 14px; border-radius: 16px; border: 1px solid #e2e8f0;
          background: #f8fafc; color: #64748b; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .jobboard-role-btn.active {
          background: #eff6ff; border-color: #2563eb; color: #2563eb;
        }

        .jobboard-input-wrapper {
          position: relative; display: flex; align-items: center; background: #f8fafc;
          border: 1px solid #e2e8f0; border-radius: 16px; transition: all 0.2s ease;
        }
        .jobboard-input-wrapper:focus-within {
          border-color: #2563eb; background: #ffffff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }
        .jobboard-input-icon { position: absolute; left: 16px; font-size: 1rem; opacity: 0.75; }
        .jobboard-input-wrapper input {
          width: 100%; border: none; outline: none; background: transparent; padding: 16px 16px 16px 46px; font-size: 1rem; color: #0f172a;
        }

        .jobboard-password-toggle {
          position: absolute; right: 14px; border: none; background: transparent; color: #2563eb; font-weight: 700; cursor: pointer;
        }

        .jobboard-login-options { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .jobboard-checkbox { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: #475569; cursor: pointer; }
        .jobboard-secure-note { font-size: 0.9rem; color: #64748b; font-weight: 600; }

        .jobboard-primary-btn {
          width: 100%; border: none; border-radius: 16px; padding: 16px; font-size: 1rem; font-weight: 700;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28); cursor: pointer;
        }

        .jobboard-divider { position: relative; text-align: center; margin: 6px 0 2px; }
        .jobboard-divider::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e2e8f0; transform: translateY(-50%); }
        .jobboard-divider span { position: relative; display: inline-block; padding: 0 14px; background: white; color: #64748b; font-size: 0.95rem; }

        .jobboard-social-login { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .jobboard-social-btn {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;
        }
        .jobboard-social-btn span {
          display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px;
          border-radius: 999px; background: white; font-size: 0.8rem; font-weight: 800; color: #2563eb; border: 1px solid #dbeafe;
        }

        .jobboard-signup-text { text-align: center; color: #475569; font-size: 0.98rem; }
        .jobboard-signup-text a { color: #2563eb; text-decoration: none; font-weight: 700; }
      `}</style>
    </section>
  );
};

export default SignUp;