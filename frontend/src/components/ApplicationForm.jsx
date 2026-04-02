import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get('job') || '';
  const jobId = searchParams.get('jobId') || '';
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    additionalMessage: '',
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

    if (!token) {
      setStatus({ type: 'error', message: 'You must be logged in to apply.' });
      return;
    }

    if (!jobId) {
      setStatus({ type: 'error', message: 'Invalid job reference. Please go back and try again.' });
      return;
    }

    setSubmitting(true);

    const body = new FormData();
    body.append('name', formData.name);
    body.append('email', formData.email);
    body.append('phone', formData.phone);
    body.append('jobId', jobId);
    body.append('additionalMessage', formData.additionalMessage);
    if (resume) body.append('resume', resume);
    if (coverLetter) body.append('coverLetter', coverLetter);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'Application submitted successfully!' });
        setFormData({ name: '', email: '', phone: '', additionalMessage: '' });
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
          {/* Position (display-only) */}
          {jobTitle && (
            <div className="jobboard-form-group">
              <label>Position Applying For</label>
              <div className="jobboard-input-wrapper">
                <span className="jobboard-input-icon">💼</span>
                <input type="text" value={jobTitle} disabled />
              </div>
            </div>
          )}

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

          {/* Phone */}
          <div className="jobboard-form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">📞</span>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 555 123 4567"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Additional Message */}
          <div className="jobboard-form-group">
            <label htmlFor="additionalMessage">Additional Message</label>
            <div className="jobboard-input-wrapper">
              <span className="jobboard-input-icon">💬</span>
              <textarea
                id="additionalMessage"
                name="additionalMessage"
                placeholder="Tell us why you're interested in this role…"
                value={formData.additionalMessage}
                onChange={handleChange}
                rows={3}
                style={{ resize: 'vertical' }}
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
