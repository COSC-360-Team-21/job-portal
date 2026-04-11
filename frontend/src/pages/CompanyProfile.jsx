import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './CompanyProfile.css';

export default function CompanyProfile() {
  const { companySlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`/api/jobs/company/${companySlug}`);

        if (!res.ok) {
          throw new Error('Failed to load company profile');
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companySlug]);

  const company = data?.company || null;
  const jobs = useMemo(() => data?.jobs || [], [data]);

  if (loading) {
    return (
      <div className="cp-page">
        <div className="cp-shell">
          <p className="cp-status">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-page">
        <div className="cp-shell">
          <p className="cp-status cp-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="cp-page">
        <div className="cp-shell">
          <p className="cp-status">Company not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-shell">
        <section className="cp-hero-card">
          <div className="cp-hero-main">
            <div className="cp-logo">
              {company.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>

            <div className="cp-hero-copy">
              <p className="cp-eyebrow">Company Profile</p>
              <h1>{company.name}</h1>
              <p className="cp-tagline">
                {company.tagline || 'Explore opportunities and learn more about this employer.'}
              </p>

              <div className="cp-meta-row">
                {company.industry && <span>{company.industry}</span>}
                {company.headquarters && <span>{company.headquarters}</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="cp-grid">
          <main className="cp-main">
            <section className="cp-card">
              <h2>About {company.name}</h2>
              <p>
                {company.description ||
                  `${company.name} is hiring for exciting roles. Browse open opportunities and learn more about the company here.`}
              </p>
            </section>

            <section className="cp-card">
              <div className="cp-section-header">
                <h2>Open Roles</h2>
                <span className="cp-badge">{jobs.length}</span>
              </div>

              {jobs.length === 0 ? (
                <p className="cp-empty">No open roles available right now.</p>
              ) : (
                <div className="cp-roles">
                  {jobs.map((job) => (
                    <Link
                      key={job._id}
                      to={`/jobs/${job._id}`}
                      className="cp-role-card"
                    >
                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.location || 'Location not specified'}</p>
                      </div>

                      <div className="cp-role-side">
                        <span>{job.workType || 'View role'}</span>
                        {job.salaryRange && <strong>{job.salaryRange}</strong>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="cp-sidebar">
            <section className="cp-info-card">
              <h3>Company Details</h3>
              <ul>
                <li>
                  <span>Industry</span>
                  <strong>{company.industry || 'Not listed'}</strong>
                </li>
                <li>
                  <span>Headquarters</span>
                  <strong>{company.headquarters || 'Not listed'}</strong>
                </li>
                <li>
                  <span>Company Size</span>
                  <strong>{company.size || 'Not listed'}</strong>
                </li>
                <li>
                  <span>Founded</span>
                  <strong>{company.founded || 'Not listed'}</strong>
                </li>
              </ul>
            </section>

            <section className="cp-info-card cp-info-card--highlight">
              <h3>Why Join?</h3>
              <p>
                {company.whyJoin ||
                  `Join ${company.name} to work on meaningful projects, collaborate with a growing team, and explore new career opportunities.`}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}