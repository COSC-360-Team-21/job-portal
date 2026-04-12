import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';

vi.mock('../context/AuthContext', () => {
  const AuthProvider = ({ children }) => children;
  const useAuth = () => ({ user: null, authLoading: false, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
  return { AuthProvider, useAuth };
});

vi.mock('../components/Notification', () => {
  const NotificationProvider = ({ children }) => children;
  const useNotification = () => ({ addNotification: vi.fn() });
  return { NotificationProvider, useNotification };
});

function renderWithRouter(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );
}

describe('App', () => {
  it('renders without crashing', () => {
    renderWithRouter();
  });

  it('shows Job Portal heading on the home page', () => {
    renderWithRouter('/');
    expect(screen.getByRole('heading', { name: /job portal/i })).toBeInTheDocument();
  });

  it('shows Login and Register navigation links on the home page', () => {
    renderWithRouter('/');
    expect(screen.getAllByRole('link', { name: /login/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /register/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Login page at /login', () => {
    renderWithRouter('/login');
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('renders Register page at /register', () => {
    renderWithRouter('/register');
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
  });

  it('navigating to Login shows back link to home', async () => {
    renderWithRouter('/login');
    expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThanOrEqual(1);
  });
});
