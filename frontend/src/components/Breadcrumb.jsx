import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const routeLabels = {
  '': 'Home',
  'jobs': 'Jobs',
  'search': 'Job Search',
  'industries': 'Industries',
  'login': 'Login',
  'register': 'Register',
  'dashboard': 'Dashboard',
  'my-applications': 'My Applications',
  'my-comments': 'Comment History',
  'admin': 'Admin Dashboard',
  'employer-profile': 'Employer Profile',
  'manage-jobs': 'Manage Jobs',
  'create-job': 'Create Job',
  'apply': 'Apply',
};

const isMongoId = (str) => /^[a-f\d]{24}$/i.test(str);

const getLabel = (segment, prevSegment) => {
  if (routeLabels[segment]) return routeLabels[segment];
  if (isMongoId(segment)) {
    if (prevSegment === 'jobs') return 'Job Details';
    if (prevSegment === 'companies') return 'Company';
    return 'Details';
  }
  return decodeURIComponent(segment);
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {pathnames.map((segment, index) => {
        const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
        const isLast = index === pathnames.length - 1;
        const prevSegment = index > 0 ? pathnames[index - 1] : '';
        const label = getLabel(segment, prevSegment);

        return (
          <span key={routeTo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="breadcrumb-separator">›</span>
            {isLast ? (
              <span className="breadcrumb-current">{label}</span>
            ) : (
              <Link to={routeTo}>{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
