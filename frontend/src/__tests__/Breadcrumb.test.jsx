import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

function renderBreadcrumb(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumb />
    </MemoryRouter>
  );
}

describe('Breadcrumb', () => {
  it('renders nothing on home page', () => {
    const { container } = renderBreadcrumb('/');
    expect(container.querySelector('.breadcrumb')).toBeNull();
  });

  it('renders Home > Jobs on /jobs', () => {
    renderBreadcrumb('/jobs');
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
  });

  it('shows Job Details instead of raw MongoDB ID', () => {
    renderBreadcrumb('/jobs/507f1f77bcf86cd799439011');
    expect(screen.getByText('Job Details')).toBeInTheDocument();
    expect(screen.queryByText('507f1f77bcf86cd799439011')).not.toBeInTheDocument();
  });

  it('renders correct label for /my-comments', () => {
    renderBreadcrumb('/my-comments');
    expect(screen.getByText('Comment History')).toBeInTheDocument();
  });

  it('renders correct label for /admin', () => {
    renderBreadcrumb('/admin');
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders correct label for /dashboard', () => {
    renderBreadcrumb('/dashboard');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
