import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreateJobPosting.css';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const WORK_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

export default function CreateJobPosting() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const p = user?.profile ?? {};

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    industry: p.industry ?? '',
    location: p.companyLocation ?? '',
    workType: 'Full-time',
    salaryRange: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const body = {
        title: form.title.trim(),
        company: p.companyName || user?.name || '',
        location: form.location.trim(),
        description: form.description.trim(),
        workType: form.workType,
        industry: form.industry.trim(),
      };
      if (form.salaryRange.trim()) body.salaryRange = form.salaryRange.trim();
      if (form.requirements.trim()) {
        body.requirements = form.requirements
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean);
      }

      const res = await fetch(`${API}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.msg ?? data.message ?? 'Failed to post job');
      navigate('/my-jobs');
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
      setSaving(false);
    }
  };

  const companyName = p.companyName || user?.name || 'Your Company';

  return (
    <main className="cjp-page">
      <Link className="cjp-back" to="/dashboard">
        ← Back to Dashboard
      </Link>

      <div className="cjp-card">
        <div className="cjp-card-header">
          <h1 className="cjp-title">✦ Create Job Posting</h1>
          <p className="cjp-subtitle">
            Post a new job opening and start receiving applications from qualified candidates
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Job Title */}
          <div className="cjp-field">
            <label className="cjp-label" htmlFor="cjp-title">
              Job Title <span className="cjp-required">*</span>
            </label>
            <input
              id="cjp-title"
              className="cjp-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          {/* Job Description */}
          <div className="cjp-field">
            <label className="cjp-label" htmlFor="cjp-description">
              Job Description <span className="cjp-required">*</span>
            </label>
            <textarea
              id="cjp-description"
              className="cjp-input cjp-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
              rows={5}
              required
            />
            <p className="cjp-hint">
              {form.description.length} characters · Be detailed to attract the right candidates
            </p>
          </div>

          {/* Requirements */}
          <div className="cjp-field">
            <label className="cjp-label" htmlFor="cjp-requirements">
              Requirements <span className="cjp-required">*</span>
            </label>
            <textarea
              id="cjp-requirements"
              className="cjp-input cjp-textarea cjp-textarea--tall"
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              placeholder={
                'Enter each requirement on a new line:\n5+ years of experience with React\nBachelor\'s degree in Computer Science\nStrong communication skills\nExperience with TypeScript'
              }
              rows={5}
              required
            />
            <p className="cjp-hint">Enter one requirement per line</p>
          </div>

          {/* Industry + Location */}
          <div className="cjp-field-row">
            <div className="cjp-field">
              <label className="cjp-label" htmlFor="cjp-industry">
                Industry <span className="cjp-required">*</span>
              </label>
              <input
                id="cjp-industry"
                className="cjp-input"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="Technology"
                required
              />
            </div>
            <div className="cjp-field">
              <label className="cjp-label" htmlFor="cjp-location">
                Location <span className="cjp-required">*</span>
              </label>
              <input
                id="cjp-location"
                className="cjp-input"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA or Remote"
                required
              />
            </div>
          </div>

          {/* Job Type + Salary */}
          <div className="cjp-field-row">
            <div className="cjp-field">
              <label className="cjp-label" htmlFor="cjp-workType">
                Job Type <span className="cjp-required">*</span>
              </label>
              <select
                id="cjp-workType"
                className="cjp-input cjp-select"
                name="workType"
                value={form.workType}
                onChange={handleChange}
                required
              >
                {WORK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="cjp-field">
              <label className="cjp-label" htmlFor="cjp-salaryRange">
                Salary Range <span className="cjp-optional">(Optional)</span>
              </label>
              <input
                id="cjp-salaryRange"
                className="cjp-input"
                name="salaryRange"
                value={form.salaryRange}
                onChange={handleChange}
                placeholder="e.g., $100,000 – $150,000"
              />
              <p className="cjp-hint">Including salary increases application rates</p>
            </div>
          </div>

          {/* Live Preview */}
          <div className="cjp-preview">
            <p className="cjp-preview-label">Preview</p>
            <div className="cjp-preview-card">
              <p className="cjp-preview-title">{form.title || 'Job Title'}</p>
              <p className="cjp-preview-meta">
                {companyName} &bull; {form.location || 'Location'} &bull; {form.workType.toLowerCase()}
              </p>
            </div>
          </div>

          {msg && (
            <div className={`cjp-msg cjp-msg--${msg.type}`}>{msg.text}</div>
          )}

          <div className="cjp-actions">
            <button type="submit" className="cjp-btn-post" disabled={saving}>
              + {saving ? 'Posting…' : 'Post Job'}
            </button>
            <button
              type="button"
              className="cjp-btn-cancel"
              onClick={() => navigate('/my-jobs')}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
