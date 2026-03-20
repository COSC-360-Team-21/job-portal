import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get('job') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    jobTitle: jobTitle,
  });
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setSubmitting(true);

    const body = new FormData();
    body.append('name', formData.name);
    body.append('email', formData.email);
    body.append('jobTitle', formData.jobTitle);
    if (resume) body.append('resume', resume);
    if (coverLetter) body.append('coverLetter', coverLetter);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        body,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'Application submitted successfully!' });
        setFormData({ name: '', email: '', jobTitle: '' });
        setResume(null);
        setCoverLetter(null);
        // reset file inputs
        e.target.reset();
      } else {
        setStatus({ type: 'error', message: data.message || 'Something went wrong. Please try again.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Unable to reach the server. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="jobboard-login-section">
      <div className="jobboard-login-card">
        <div className="jobboard-login-header">
          <span className="jobboard-login-badge">Apply Now</span>
          <h1>Job Application</h1>
          <p>
            Fill in your details and upload your documents to apply.
            We&apos;ll get back to you as soon as possible.
          </p>
        </div>

        {status.message && (
          <div className={`app-form-alert app-form-alert--${status.type}`} role="alert">
            {status.message}
          </div>
        )}

        <form className="jobboard-login-form" onSubmit={handleSubmit}>
          {/* Applicant Name */}
          <div className="jobboard-form-group">
            <label htmlFor="name">Full Name</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">👤</span>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="jobboard-form-group">
            <label htmlFor="email">Email</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">✉</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Job Title / Position */}
          <div className="jobboard-form-group">
            <label htmlFor="jobTitle">Position Applying For</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">💼</span>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="e.g. Frontend Developer"
                value={formData.jobTitle}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="jobboard-form-group">
            <label htmlFor="resume">Resume</label>
            <div className="app-form-file-wrapper">
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0] || null)}
                required
              />
              <p className="app-form-file-hint">PDF, DOC, or DOCX (max 5 MB)</p>
            </div>
          </div>

          {/* Cover Letter Upload */}
          <div className="jobboard-form-group">
            <label htmlFor="coverLetter">Cover Letter (CV)</label>
            <div className="app-form-file-wrapper">
              <input
                id="coverLetter"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCoverLetter(e.target.files[0] || null)}
              />
              <p className="app-form-file-hint">Optional — PDF, DOC, or DOCX (max 5 MB)</p>
            </div>
          </div>

          <button
            type="submit"
            className="jobboard-primary-btn"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>

          <Link to="/jobs" className="app-form-back-link">
            ← Back to Job Listings
          </Link>
        </form>
      </div>
    </section>
  );
};

export default ApplicationForm;
