import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../app.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const WORK_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const randomWorkType = () => faker.helpers.arrayElement(WORK_TYPES);

const buildJobPayload = (overrides = {}) => ({
  title: faker.person.jobTitle(),
  company: faker.company.name(),
  location: `${faker.location.city()}, ${faker.location.countryCode()}`,
  description: faker.lorem.sentence(),
  requirements: [faker.person.jobArea(), faker.helpers.arrayElement(['Node.js', 'React', 'MongoDB'])],
  salaryRange: `${faker.number.int({ min: 50, max: 90 })}k-${faker.number.int({ min: 91, max: 180 })}k`,
  workType: randomWorkType(),
  ...overrides,
});

async function registerUser(role = 'employer', prefix = 'jobs') {
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

async function seedJobs(total = 15) {
  const employer = await User.create({
    name: faker.person.fullName(),
    email: `employer-get-${faker.string.uuid()}@example.com`,
    password: 'password123',
    role: 'employer',
  });

  const jobs = Array.from({ length: total }, () => ({
    ...buildJobPayload(),
    postedBy: employer._id,
  }));

  await Job.insertMany(jobs);
}

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

describe('POST /api/jobs', () => {
  it('creates a job for authenticated employer', async () => {
    const { token } = await registerUser('employer', 'create');
    const createPayload = buildJobPayload({ workType: 'Full-time' });

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(createPayload);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(createPayload.title);
    expect(res.body.company).toBe(createPayload.company);
  });

  it('returns 401 when token is missing', async () => {
    const createPayload = buildJobPayload({ workType: 'Full-time' });
    const res = await request(app).post('/api/jobs').send(createPayload);

    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is not employer', async () => {
    const { token } = await registerUser('jobseeker', 'create-jobseeker');
    const createPayload = buildJobPayload({ workType: 'Full-time' });

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(createPayload);

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/jobs/:id', () => {
  it('updates a job when owner is authenticated employer', async () => {
    const { token, userId } = await registerUser('employer', 'update-owner');
    const updatePayload = {
      title: faker.person.jobTitle(),
      workType: 'Contract',
    };
    const job = await Job.create({
      ...buildJobPayload({ workType: 'Full-time' }),
      postedBy: userId,
    });

    const res = await request(app)
      .put(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updatePayload.title);
    expect(res.body.workType).toBe(updatePayload.workType);
  });

  it('returns 403 when authenticated employer is not the owner', async () => {
    const owner = await registerUser('employer', 'update-owner');
    const other = await registerUser('employer', 'update-other');
    const updatePayload = {
      title: faker.person.jobTitle(),
      workType: 'Contract',
    };

    const job = await Job.create({
      ...buildJobPayload({ workType: 'Full-time' }),
      postedBy: owner.userId,
    });

    const res = await request(app)
      .put(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send(updatePayload);

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid job id', async () => {
    const { token } = await registerUser('employer', 'update-invalid');
    const updatePayload = {
      title: faker.person.jobTitle(),
      workType: 'Contract',
    };

    const res = await request(app)
      .put('/api/jobs/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe('DELETE /api/jobs/:id', () => {
  it('deletes a job when owner is authenticated employer', async () => {
    const { token, userId } = await registerUser('employer', 'delete-owner');
    const job = await Job.create({
      ...buildJobPayload({ workType: 'Full-time' }),
      postedBy: userId,
    });

    const res = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it('returns 403 when authenticated employer is not the owner', async () => {
    const owner = await registerUser('employer', 'delete-owner');
    const other = await registerUser('employer', 'delete-other');

    const job = await Job.create({
      ...buildJobPayload({ workType: 'Full-time' }),
      postedBy: owner.userId,
    });

    const res = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid job id', async () => {
    const { token } = await registerUser('employer', 'delete-invalid');

    const res = await request(app)
      .delete('/api/jobs/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
