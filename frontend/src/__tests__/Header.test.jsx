import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';

// Mock useAuth
const mockLogout = vi.fn();
const mockNavigate = vi.fn();
let mockUser = null;
let mockAuthLoading = false;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, logout: mockLogout, authLoading: mockAuthLoading }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    mockUser = null;
    mockAuthLoading = false;
    mockLogout.mockClear();
    mockNavigate.mockClear();
  });

  it('renders logo text', () => {
    renderHeader();
    expect(screen.getByText('JobBoard')).toBeInTheDocument();
  });

  it('shows guest links when not logged in', () => {
    renderHeader();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('Industries')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows job seeker links when logged in as jobseeker', () => {
    mockUser = { name: 'Jane Doe', role: 'jobseeker' };
    renderHeader();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('My Comments')).toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('shows employer links when logged in as employer', () => {
    mockUser = { name: 'Acme Corp', role: 'employer' };
    renderHeader();
    expect(screen.getByText('My Jobs')).toBeInTheDocument();
    expect(screen.getByText('Post a Job')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('shows admin links when logged in as admin', () => {
    mockUser = { name: 'Admin', role: 'admin' };
    renderHeader();
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Jobs')).toBeInTheDocument();
  });

  it('shows user name initial when no profile image', () => {
    mockUser = { name: 'Jane Doe', role: 'jobseeker' };
    renderHeader();
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('shows profile image when available', () => {
    mockUser = { name: 'Jane Doe', role: 'jobseeker', profileImage: '/uploads/avatar.jpg' };
    renderHeader();
    const img = screen.getByAltText('Jane Doe');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/uploads/avatar.jpg');
  });

  it('calls logout and navigates to home on logout click', () => {
    mockUser = { name: 'Jane Doe', role: 'jobseeker' };
    renderHeader();
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows Login link for guest users', () => {
    renderHeader();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('hides actions while auth is loading', () => {
    mockAuthLoading = true;
    renderHeader();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('displays role label for employer', () => {
    mockUser = { name: 'Acme', role: 'employer' };
    renderHeader();
    expect(screen.getByText('Employer account')).toBeInTheDocument();
  });

  it('displays role label for admin', () => {
    mockUser = { name: 'Admin User', role: 'admin' };
    const { container } = renderHeader();
    expect(container.querySelector('.jb-user-role').textContent).toBe('Admin');
  });
});
