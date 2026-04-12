import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const guestLinks = [
    { label: 'Jobs', to: '/jobs' },
    { label: 'Industries', to: '/industries' },
    { label: 'Register', to: '/register' },
  ];

  const jobSeekerLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Jobs', to: '/jobs' },
    { label: 'Industries', to: '/industries' },
    { label: 'My Applications', to: '/my-applications' },
    { label: 'My Comments', to: '/my-comments' },
  ];

  const employerLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Jobs', to: '/my-jobs' },
    { label: 'Post a Job', to: '/create-job' },
    { label: 'Profile', to: '/profile' },
    { label: 'Industries', to: '/industries' },
  ];

  const adminLinks = [
    { label: 'Admin', to: '/admin' },
    { label: 'Jobs', to: '/jobs' },
    { label: 'Industries', to: '/industries' },
  ];

  const navLinks = !user
    ? guestLinks
    : user.role === 'admin'
      ? adminLinks
      : user.role === 'employer'
        ? employerLinks
        : jobSeekerLinks;

  return (
    <header className="jb-header">
      <div className="jb-header-inner">
        <Link to={user ? '/dashboard' : '/'} className="jb-logo">
          <span className="jb-logo-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </span>
          <span className="jb-logo-text">JobBoard</span>
        </Link>

        <nav className="jb-nav">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`jb-nav-link${location.pathname === to ? ' jb-nav-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="jb-header-actions">
          {authLoading ? null : user ? (
            <>
              <Link to="/dashboard" className="jb-profile-shortcut">
                <span className="jb-profile-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    (user.name?.[0] || 'U').toUpperCase()
                  )}
                </span>
                <span className="jb-user-chip">
                  <span className="jb-user-name">{user.name?.split(' ')[0] || 'User'}</span>
                  <span className="jb-user-role">
                    {user.role === 'admin' ? 'Admin' : user.role === 'employer' ? 'Employer account' : 'View profile'}
                  </span>
                </span>
              </Link>

              <button onClick={handleLogout} className="jb-login-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="jb-login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;