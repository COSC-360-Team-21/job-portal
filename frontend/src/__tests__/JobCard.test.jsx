import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobCard from '../components/JobCard';

const defaultProps = {
  id: '507f1f77bcf86cd799439011',
  title: 'Software Engineer',
  company: 'TestCorp',
  location: 'Vancouver, BC',
  workType: 'Full-time',
  salary: '80k-120k',
  postedDate: 'Jan 1, 2026',
  skills: ['React', 'Node.js', 'MongoDB'],
  onApply: vi.fn(),
  onSave: vi.fn(),
};

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <JobCard {...defaultProps} {...overrides} />
    </MemoryRouter>
  );
}

describe('JobCard', () => {
  it('renders job title, company, location', () => {
    renderCard();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('TestCorp')).toBeInTheDocument();
    expect(screen.getByText('Vancouver, BC')).toBeInTheDocument();
  });

  it('renders work type badge', () => {
    renderCard();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
  });

  it('renders all skills', () => {
    renderCard();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
  });

  it('renders salary and posted date', () => {
    renderCard();
    expect(screen.getByText('80k-120k')).toBeInTheDocument();
    expect(screen.getByText(/Jan 1, 2026/)).toBeInTheDocument();
  });

  it('title links to job detail page', () => {
    renderCard();
    const link = screen.getByRole('link', { name: /software engineer/i });
    expect(link).toHaveAttribute('href', '/jobs/507f1f77bcf86cd799439011');
  });

  it('calls onApply when View Details button is clicked', () => {
    const onApply = vi.fn();
    renderCard({ onApply });
    fireEvent.click(screen.getByText('View Details'));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('toggles save state on Save button click', () => {
    renderCard();
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Saved'));
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders company initial as logo', () => {
    renderCard();
    expect(screen.getByText('T')).toBeInTheDocument(); // TestCorp → T
  });

  it('renders without skills when empty', () => {
    renderCard({ skills: [] });
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('renders without salary when null', () => {
    renderCard({ salary: null });
    expect(screen.queryByText('80k-120k')).not.toBeInTheDocument();
  });
});
