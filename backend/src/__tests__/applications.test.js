import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../app.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const WORK_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

async function registerUser(role = 'jobseeker', prefix = 'apps') {
  const unique = faker.string.uuid();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: `${prefix}-${faker.person.fullName()}`,
      email: `${prefix}-${unique}@example.com`,
      password: 'password123',
      role,
    });
  return { token: res.body.token, userId: res.body.user.id };
}

async function seedApplications(applicantId, counts) {
  const employer = await User.create({
    name: faker.person.fullName(),
    email: `employer-seed-${faker.string.uuid()}@example.com`,
    password: 'password123',
    role: 'employer',
  });

  const job = await Job.create({
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    location: faker.location.city(),
    description: faker.lorem.sentence(),
    workType: faker.helpers.arrayElement(WORK_TYPES),
    postedBy: employer._id,
  });

  const docs = [];
  for (const [status, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i++) {
      docs.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: '555-123-4567',
        job: job._id,
        applicant: applicantId,
        applicationStatus: status,
        resumePath: 'uploads/test-resume.pdf',
      });
    }
  }

  await Application.insertMany(docs);
}

// ─── GET /api/applications/stats ─────────────────────────────────────────────

describe('GET /api/applications/stats', () => {
  it('returns zero counts when jobseeker has no applications', async () => {
    const { token } = await registerUser('jobseeker', 'stats-empty');

    const res = await request(app)
      .get('/api/applications/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0 });
  });

  it('returns correct counts matching seeded applications', async () => {
    const { token, userId } = await registerUser('jobseeker', 'stats-counts');
    await seedApplications(userId, { pending: 3, reviewed: 2, shortlisted: 1, rejected: 4 });

    const res = await request(app)
      .get('/api/applications/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(10);
    expect(res.body.pending).toBe(3);
    expect(res.body.reviewed).toBe(2);
    expect(res.body.shortlisted).toBe(1);
    expect(res.body.rejected).toBe(4);
  });

  it('only counts the authenticated jobseeker\'s own applications', async () => {
    const { token, userId } = await registerUser('jobseeker', 'stats-isolation');
    const { userId: otherId } = await registerUser('jobseeker', 'stats-other');

    await seedApplications(userId, { pending: 2 });
    await seedApplications(otherId, { shortlisted: 5 });

    const res = await request(app)
      .get('/api/applications/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.pending).toBe(2);
    expect(res.body.shortlisted).toBe(0);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/applications/stats');

    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is an employer', async () => {
    const { token } = await registerUser('employer', 'stats-employer');

    const res = await request(app)
      .get('/api/applications/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
