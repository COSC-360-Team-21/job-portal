import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EmployerProfile.css';

export default function EmployerProfile() {
  const { token, user, persistAuth } = useAuth();
  const navigate = useNavigate();

  const p = user?.profile ?? {};
  const avatarLetter = (p.companyName || user?.name || 'E').charAt(0).toUpperCase();

  const [form, setForm] = useState({
    companyName: p.companyName ?? '',
    industry: p.industry ?? '',
    companyDescription: p.companyDescription ?? '',
    websiteUrl: p.websiteUrl ?? '',
    companyLogoUrl: p.companyLogoUrl ?? '',
    companyLocation: p.companyLocation ?? '',
    companySize: p.companySize ?? '',
    contactEmail: p.contactEmail ?? '',
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
      const profilePatch = {
        companyName: form.companyName.trim(),
        industry: form.industry.trim(),
        companyDescription: form.companyDescription.trim(),
        companyLocation: form.companyLocation.trim(),
      };
      if (form.companySize) profilePatch.companySize = form.companySize;
      if (form.contactEmail.trim()) profilePatch.contactEmail = form.contactEmail.trim();
      if (form.websiteUrl.trim()) profilePatch.websiteUrl = form.websiteUrl.trim();
      if (form.companyLogoUrl.trim()) profilePatch.companyLogoUrl = form.companyLogoUrl.trim();

      const res = await fetch(`/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: profilePatch }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.errors?.[0]?.msg ?? data.message ?? 'Failed to save';
        throw new Error(errMsg);
      }
      persistAuth(token, data);
      setMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const logoValid = form.companyLogoUrl.trim().startsWith('http');

  return (
    <main className="ep-page">
      <Link className="ep-back" to="/dashboard">
        ← Back to Dashboard
      </Link>

      <div className="ep-card">
        <div className="ep-card-header">
          <h1 className="ep-card-title">Edit Company Profile</h1>
          <p className="ep-card-sub">Update your company information to attract top talent</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Logo */}
          <div className="ep-logo-row">
            <div className="ep-logo-circle">
              {logoValid ? (
                <img
                  src={form.companyLogoUrl}
                  alt="Company logo"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <div className="ep-logo-inputs">
              <p className="ep-logo-label">Company Logo</p>
              <input
                className="ep-input"
                name="companyLogoUrl"
                value={form.companyLogoUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-…"
              />
              <p className="ep-logo-hint">Paste a URL to your company logo image</p>
            </div>
          </div>

          {/* Company Name */}
          <div className="ep-field">
            <label className="ep-label" htmlFor="ep-companyName">
              Company Name <span className="ep-required">*</span>
            </label>
            <input
              id="ep-companyName"
              className="ep-input"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="TechCorp Inc."
              required
            />
          </div>

          {/* Industry */}
          <div className="ep-field">
            <label className="ep-label" htmlFor="ep-industry">
              Industry <span className="ep-required">*</span>
            </label>
            <input
              id="ep-industry"
              className="ep-input"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="Technology"
              required
            />
          </div>

          {/* Company Description */}
          <div className="ep-field">
            <label className="ep-label" htmlFor="ep-companyDescription">
              Company Description <span className="ep-required">*</span>
            </label>
            <textarea
              id="ep-companyDescription"
              className="ep-input ep-textarea"
              name="companyDescription"
              value={form.companyDescription}
              onChange={handleChange}
              placeholder="Tell job seekers about your company, mission, and culture…"
              rows={4}
              required
            />
            <p className="ep-char-count">{form.companyDescription.length} characters</p>
          </div>

          {/* Website */}
          <div className="ep-field">
            <label className="ep-label" htmlFor="ep-websiteUrl">Company Website</label>
            <input
              id="ep-websiteUrl"
              className="ep-input"
              name="websiteUrl"
              value={form.websiteUrl}
              onChange={handleChange}
              placeholder="https://techcorp.example.com"
            />
          </div>

          {/* Location + Size */}
          <div className="ep-field-row">
            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-companyLocation">Location</label>
              <input
                id="ep-companyLocation"
                className="ep-input"
                name="companyLocation"
                value={form.companyLocation}
                onChange={handleChange}
                placeholder="Vancouver, BC"
              />
            </div>
            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-contactEmail">Contact Email</label>
              <input
                id="ep-contactEmail"
                className="ep-input"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="hiring@company.com"
              />
            </div>
          </div>

          {msg && (
            <div className={`ep-msg ep-msg--${msg.type}`}>{msg.text}</div>
          )}

          <div className="ep-actions">
            <button type="submit" className="ep-btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="ep-btn-cancel"
              onClick={() => navigate('/dashboard')}
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
