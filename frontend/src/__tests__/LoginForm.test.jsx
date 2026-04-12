import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const mockLogin = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renders email and password inputs', () => {
    renderLoginForm();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderLoginForm();
    const submitBtn = screen.getByRole('button', { name: /^continue$/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveAttribute('type', 'submit');
  });

  it('renders link to register page', () => {
    renderLoginForm();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    renderLoginForm();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderLoginForm();
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
