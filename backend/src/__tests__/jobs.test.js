import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../app.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { registerUser, buildJobPayload, createJob } from './helpers.js';

async function seedJobs(total = 15) {
  const employer = await User.create({
    name: faker.person.fullName(),
    email: `${faker.string.uuid()}@example.com`,
    password: 'password123',
    role: 'employer',
  });

  await Job.insertMany(
    Array.from({ length: total }, () => ({ ...buildJobPayload(), postedBy: employer._id }))
  );
}

// ─── GET /api/jobs ────────────────────────────────────────────────────────────

describe('GET /api/jobs', () => {
  it('returns paginated jobs with default page and limit', async () => {
    await seedJobs(15);

    const res = await request(app).get('/api/jobs');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(10);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalItems: 15,
      totalPages: 2,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  it('returns requested page and limit', async () => {
    await seedJobs(15);

    const res = await request(app).get('/api/jobs?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.totalItems).toBe(15);
    expect(res.body.pagination.totalPages).toBe(3);
    expect(res.body.pagination.hasNextPage).toBe(true);
    expect(res.body.pagination.hasPrevPage).toBe(true);
  });

  it('returns 400 for invalid pagination query params', async () => {
    const res = await request(app).get('/api/jobs?page=0&limit=500');

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

// ─── GET /api/jobs — search and filters ──────────────────────────────────────

describe('GET /api/jobs filters', () => {
  beforeEach(async () => {
    const employer = await User.create({
      name: faker.person.fullName(),
      email: `${faker.string.uuid()}@example.com`,
      password: 'password123',
      role: 'employer',
    });

    await Job.insertMany([
      {
        ...buildJobPayload({ title: 'Senior React Engineer', location: 'Berlin, DE', workType: 'Full-time', requirements: [] }),
        postedBy: employer._id,
      },
      {
        ...buildJobPayload({ title: 'Node.js Backend Developer', location: 'Remote, US', workType: 'Contract', requirements: [] }),
        postedBy: employer._id,
      },
      {
        ...buildJobPayload({ title: 'Marketing Manager', location: 'London, UK', workType: 'Part-time', requirements: [] }),
        postedBy: employer._id,
      },
    ]);
  });

  it('filters by search query (q) matching title', async () => {
    const res = await request(app).get('/api/jobs?q=React');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Senior React Engineer');
  });

  it('filters by location', async () => {
    const res = await request(app).get('/api/jobs?location=Berlin');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].location).toMatch(/Berlin/i);
  });

  it('filters by workType', async () => {
    const res = await request(app).get('/api/jobs?workType=Contract');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].workType).toBe('Contract');
  });

  it('returns 400 for invalid workType', async () => {
    const res = await request(app).get('/api/jobs?workType=Freelance');

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns all jobs when no filters are applied', async () => {
    const res = await request(app).get('/api/jobs');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('returns empty data when search query matches nothing', async () => {
    const res = await request(app).get('/api/jobs?q=xyznonexistentkeyword');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.totalItems).toBe(0);
  });
});

// ─── POST /api/jobs ───────────────────────────────────────────────────────────

describe('POST /api/jobs', () => {
  it('creates a job for authenticated employer', async () => {
    const { token } = await registerUser('employer');
    const payload = buildJobPayload({ workType: 'Full-time' });

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(payload.title);
    expect(res.body.company).toBe(payload.company);
  });

  it('returns 401 when token is missing', async () => {
    const res = await request(app).post('/api/jobs').send(buildJobPayload({ workType: 'Full-time' }));
    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is not employer', async () => {
    const { token } = await registerUser('jobseeker');

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(buildJobPayload({ workType: 'Full-time' }));

    expect(res.status).toBe(403);
  });
});

// ─── GET /api/jobs/mine ───────────────────────────────────────────────────────

describe('GET /api/jobs/mine', () => {
  it('returns only the authenticated employers own jobs', async () => {
    const employer = await registerUser('employer');
    const other = await registerUser('employer');

    await Job.insertMany([
      { ...buildJobPayload(), postedBy: employer.userId },
      { ...buildJobPayload(), postedBy: employer.userId },
      { ...buildJobPayload(), postedBy: other.userId },
    ]);

    const res = await request(app)
      .get('/api/jobs/mine')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.totalItems).toBe(2);
  });

  it('returns empty list when employer has no jobs', async () => {
    const employer = await registerUser('employer');

    const res = await request(app)
      .get('/api/jobs/mine')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.totalItems).toBe(0);
  });

  it('respects pagination parameters', async () => {
    const employer = await registerUser('employer');

    await Job.insertMany(
      Array.from({ length: 7 }, () => ({ ...buildJobPayload(), postedBy: employer.userId }))
    );

    const res = await request(app)
      .get('/api/jobs/mine?page=2&limit=3')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(3);
    expect(res.body.pagination.totalItems).toBe(7);
    expect(res.body.pagination.hasNextPage).toBe(true);
    expect(res.body.pagination.hasPrevPage).toBe(true);
  });

  it('filters by status', async () => {
    const employer = await registerUser('employer');

    await Job.insertMany([
      { ...buildJobPayload(), postedBy: employer.userId, status: 'active' },
      { ...buildJobPayload(), postedBy: employer.userId, status: 'active' },
      { ...buildJobPayload(), postedBy: employer.userId, status: 'closed' },
    ]);

    const res = await request(app)
      .get('/api/jobs/mine?status=active')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    res.body.data.forEach((job) => expect(job.status).toBe('active'));
  });

  it('filters by search query matching title', async () => {
    const employer = await registerUser('employer');

    await Job.insertMany([
      { ...buildJobPayload({ title: 'Senior Node Developer', requirements: [] }), postedBy: employer.userId },
      { ...buildJobPayload({ title: 'React Frontend Engineer', requirements: [] }), postedBy: employer.userId },
    ]);

    const res = await request(app)
      .get('/api/jobs/mine?q=Node')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Senior Node Developer');
  });

  it('returns 400 for invalid status value', async () => {
    const { token } = await registerUser('employer');

    const res = await request(app)
      .get('/api/jobs/mine?status=unknown')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/jobs/mine');
    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is a jobseeker', async () => {
    const { token } = await registerUser('jobseeker');

    const res = await request(app)
      .get('/api/jobs/mine')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// ─── PUT /api/jobs/:id ────────────────────────────────────────────────────────

describe('PUT /api/jobs/:id', () => {
  it('updates a job when owner is authenticated employer', async () => {
    const { token, userId } = await registerUser('employer');
    const job = await createJob(userId);
    const updatePayload = { title: faker.person.jobTitle(), workType: 'Contract' };

    const res = await request(app)
      .put(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updatePayload.title);
    expect(res.body.workType).toBe(updatePayload.workType);
  });

  it('returns 403 when authenticated employer is not the owner', async () => {
    const owner = await registerUser('employer');
    const { token } = await registerUser('employer');
    const job = await createJob(owner.userId);

    const res = await request(app)
      .put(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: faker.person.jobTitle(), workType: 'Contract' });

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid job id', async () => {
    const { token } = await registerUser('employer');

    const res = await request(app)
      .put('/api/jobs/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: faker.person.jobTitle(), workType: 'Contract' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ─── DELETE /api/jobs/:id ─────────────────────────────────────────────────────

describe('DELETE /api/jobs/:id', () => {
  it('deletes a job when owner is authenticated employer', async () => {
    const { token, userId } = await registerUser('employer');
    const job = await createJob(userId);

    const res = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it('returns 403 when authenticated employer is not the owner', async () => {
    const owner = await registerUser('employer');
    const { token } = await registerUser('employer');
    const job = await createJob(owner.userId);

    const res = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid job id', async () => {
    const { token } = await registerUser('employer');

    const res = await request(app)
      .delete('/api/jobs/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
