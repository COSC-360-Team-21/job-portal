import request from 'supertest';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import app from '../app.js';
import Application from '../models/Application.js';
import { registerUser, createJob } from './helpers.js';

// Minimal PDF buffer — fileFilter only checks extension, not content
const FAKE_PDF = Buffer.from('%PDF-1.4 test');

function buildApplicationData(jobId, applicantId, overrides = {}) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: '+1234567890',
    job: jobId,
    applicant: applicantId,
    resumePath: 'uploads/test.pdf',
    ...overrides,
  };
}

function createApplication(jobId, applicantId, overrides = {}) {
  return Application.create(buildApplicationData(jobId, applicantId, overrides));
}

function seedApplications(jobId, applicantId, count, overrides = {}) {
  return Application.insertMany(
    Array.from({ length: count }, () => buildApplicationData(jobId, applicantId, overrides))
  );
}

// Helper to build a POST /api/applications request with sensible defaults.
// Pass token=null to omit the Authorization header.
// Use overrides to swap individual fields or set attachResume=false.
function postApplication(token, jobId, overrides = {}) {
  const {
    attachResume = true,
    name = 'John Doe',
    email = 'john@example.com',
    phone = '+1234567890',
    jobId: jobIdOverride,
  } = overrides;

  let req = request(app).post('/api/applications');
  if (token) req = req.set('Authorization', `Bearer ${token}`);

  req = req
    .field('name', name)
    .field('email', email)
    .field('phone', phone)
    .field('jobId', jobIdOverride ?? jobId.toString());

  if (attachResume) req = req.attach('resume', FAKE_PDF, 'resume.pdf');

  return req;
}

// ─── POST /api/applications ───────────────────────────────────────────────────

describe('POST /api/applications', () => {
  let jobseeker, employer, job;

  beforeEach(async () => {
    jobseeker = await registerUser('jobseeker');
    employer = await registerUser('employer');
    job = await createJob(employer.userId);
  });

  it('returns 201 when jobseeker submits a valid application', async () => {
    const res = await postApplication(jobseeker.token, job._id);

    expect(res.status).toBe(201);
    expect(res.body.applicationId).toBeDefined();
    expect(res.body.message).toMatch(/submitted successfully/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await postApplication(null, job._id);
    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is an employer', async () => {
    const res = await postApplication(employer.token, job._id);
    expect(res.status).toBe(403);
  });

  it('returns 404 when job does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await postApplication(jobseeker.token, fakeId);
    expect(res.status).toBe(404);
  });

  it('returns 400 when job is closed', async () => {
    const closedJob = await createJob(employer.userId, { status: 'closed' });
    const res = await postApplication(jobseeker.token, closedJob._id);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no longer accepting/i);
  });

  it('returns 400 when resume is missing', async () => {
    const res = await postApplication(jobseeker.token, job._id, { attachResume: false });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when jobId is invalid format', async () => {
    const res = await postApplication(jobseeker.token, job._id, { jobId: 'not-a-valid-id' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when phone number is invalid', async () => {
    const res = await postApplication(jobseeker.token, job._id, { phone: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when email is invalid', async () => {
    const res = await postApplication(jobseeker.token, job._id, { email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ─── GET /api/applications/mine ───────────────────────────────────────────────

describe('GET /api/applications/mine', () => {
  let jobseeker, employer, job;

  beforeEach(async () => {
    jobseeker = await registerUser('jobseeker');
    employer = await registerUser('employer');
    job = await createJob(employer.userId);
  });

  it('returns paginated applications for authenticated jobseeker', async () => {
    await seedApplications(job._id, jobseeker.userId, 3);

    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${jobseeker.token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.pagination).toMatchObject({ page: 1, totalItems: 3 });
  });

  it('returns empty list when jobseeker has no applications', async () => {
    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${jobseeker.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.totalItems).toBe(0);
  });

  it('does not return applications belonging to other jobseekers', async () => {
    const other = await registerUser('jobseeker');
    await createApplication(job._id, other.userId);

    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${jobseeker.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('respects pagination parameters', async () => {
    await seedApplications(job._id, jobseeker.userId, 5);

    const res = await request(app)
      .get('/api/applications/mine?page=2&limit=2')
      .set('Authorization', `Bearer ${jobseeker.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.totalItems).toBe(5);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/applications/mine');
    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is an employer', async () => {
    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(403);
  });
});

// ─── GET /api/applications/received ──────────────────────────────────────────

describe('GET /api/applications/received', () => {
  let employer, jobseeker, job;

  beforeEach(async () => {
    employer = await registerUser('employer');
    jobseeker = await registerUser('jobseeker');
    job = await createJob(employer.userId);
  });

  it('returns applications received for employer jobs', async () => {
    await seedApplications(job._id, jobseeker.userId, 3);

    const res = await request(app)
      .get('/api/applications/received')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.pagination.totalItems).toBe(3);
  });

  it('returns empty list when employer has no jobs', async () => {
    const newEmployer = await registerUser('employer');

    const res = await request(app)
      .get('/api/applications/received')
      .set('Authorization', `Bearer ${newEmployer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.totalItems).toBe(0);
  });

  it('does not return applications for other employers jobs', async () => {
    const other = await registerUser('employer');
    const otherJob = await createJob(other.userId);
    await createApplication(otherJob._id, jobseeker.userId);

    const res = await request(app)
      .get('/api/applications/received')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filters by applicationStatus', async () => {
    await createApplication(job._id, jobseeker.userId, { applicationStatus: 'reviewed' });
    await createApplication(job._id, jobseeker.userId, { applicationStatus: 'pending' });

    const res = await request(app)
      .get('/api/applications/received?applicationStatus=reviewed')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].applicationStatus).toBe('reviewed');
  });

  it('filters by jobId', async () => {
    const job2 = await createJob(employer.userId);
    await createApplication(job._id, jobseeker.userId);
    await createApplication(job2._id, jobseeker.userId);

    const res = await request(app)
      .get(`/api/applications/received?jobId=${job._id}`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].job._id.toString()).toBe(job._id.toString());
  });

  it('returns 403 when filtering by a job that belongs to another employer', async () => {
    const other = await registerUser('employer');
    const otherJob = await createJob(other.userId);

    const res = await request(app)
      .get(`/api/applications/received?jobId=${otherJob._id}`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(403);
  });

  it('filters by search query matching applicant name', async () => {
    await createApplication(job._id, jobseeker.userId, { name: 'Alice Wonder', email: 'alice@example.com' });
    await createApplication(job._id, jobseeker.userId, { name: 'Bob Builder', email: 'bob@example.com' });

    const res = await request(app)
      .get('/api/applications/received?search=alice')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alice Wonder');
  });

  it('returns 400 for invalid applicationStatus value', async () => {
    const res = await request(app)
      .get('/api/applications/received?applicationStatus=invalid')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/applications/received');
    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is a jobseeker', async () => {
    const res = await request(app)
      .get('/api/applications/received')
      .set('Authorization', `Bearer ${jobseeker.token}`);

    expect(res.status).toBe(403);
  });
});

// ─── PATCH /api/applications/:id/status ──────────────────────────────────────

describe('PATCH /api/applications/:id/status', () => {
  let employer, jobseeker, job, application;

  beforeEach(async () => {
    employer = await registerUser('employer');
    jobseeker = await registerUser('jobseeker');
    job = await createJob(employer.userId);
    application = await createApplication(job._id, jobseeker.userId);
  });

  it('updates application status when employer owns the job', async () => {
    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(200);
    expect(res.body.applicationStatus).toBe('reviewed');
    expect(res.body.message).toMatch(/status updated/i);
  });

  it('allows all valid status transitions', async () => {
    for (const status of ['reviewed', 'shortlisted', 'rejected', 'pending']) {
      const app_ = await createApplication(job._id, jobseeker.userId);
      const res = await request(app)
        .patch(`/api/applications/${app_._id}/status`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ status });

      expect(res.status).toBe(200);
      expect(res.body.applicationStatus).toBe(status);
    }
  });

  it('returns 403 when employer does not own the job', async () => {
    const other = await registerUser('employer');

    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(403);
  });

  it('returns 404 when application does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/applications/${fakeId}/status`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid application id', async () => {
    const res = await request(app)
      .patch('/api/applications/not-a-valid-id/status')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(400);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is a jobseeker', async () => {
    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${jobseeker.token}`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(403);
  });
});
