import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUp from '../components/SignUp';

const mockRegister = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

function renderSignUp() {
  return render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );
}

describe('SignUp', () => {
  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('renders all required fields', () => {
    renderSignUp();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders role selection buttons', () => {
    renderSignUp();
    expect(screen.getByRole('button', { name: /job seeker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /employer/i })).toBeInTheDocument();
  });

  it('renders profile image upload field', () => {
    renderSignUp();
    expect(screen.getByLabelText(/profile image/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderSignUp();
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'differentpass' } });

    // Check the agree checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows error when terms not agreed', async () => {
    renderSignUp();
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument();
    });
  });

  it('accepts image files only', () => {
    renderSignUp();
    const fileInput = screen.getByLabelText(/profile image/i);
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp');
  });

  it('toggles password visibility', () => {
    renderSignUp();
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByText(/show/i));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
