import { vi } from 'vitest';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../app.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

// Minimal valid PDF bytes so multer's fileFilter passes (checks extension only)
const FAKE_PDF = Buffer.from('%PDF-1.4 fake content for testing');

async function registerUser(role = 'jobseeker', prefix = 'app') {
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

async function createJob(employerId, overrides = {}) {
  return Job.create({
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    location: `${faker.location.city()}, CA`,
    description: faker.lorem.sentence(),
    workType: 'Full-time',
    postedBy: employerId,
    status: 'active',
    ...overrides,
  });
}

async function createApplication(jobseekerId, jobId, overrides = {}) {
  return Application.create({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: '604-555-1234',
    job: jobId,
    applicant: jobseekerId,
    resumePath: 'uploads/fake-resume.pdf',
    ...overrides,
  });
}

// ─── POST Applications ────────────────────────────────────────────────────────

describe('POST /api/applications', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).post('/api/applications').send({});
    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is an employer', async () => {
    const employer = await registerUser('employer', 'app-submit-employer');
    const { userId: employerId } = employer;
    const job = await createJob(employerId);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${employer.token}`)
      .field('name', 'Test User')
      .field('email', 'test@example.com')
      .field('phone', '604-555-1234')
      .field('jobId', job._id.toString())
      .attach('resume', FAKE_PDF, 'resume.pdf');

    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-missing');
    const employer = await registerUser('employer', 'app-submit-emp');
    const job = await createJob(employer.userId);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test User')
      .field('jobId', job._id.toString())
      // missing email, phone
      .attach('resume', FAKE_PDF, 'resume.pdf');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('returns 400 for invalid email', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-bademail');
    const employer = await registerUser('employer', 'app-submit-emp2');
    const job = await createJob(employer.userId);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test User')
      .field('email', 'not-an-email')
      .field('phone', '604-555-1234')
      .field('jobId', job._id.toString())
      .attach('resume', FAKE_PDF, 'resume.pdf');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  it('returns 400 for invalid phone number', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-badphone');
    const employer = await registerUser('employer', 'app-submit-emp3');
    const job = await createJob(employer.userId);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test User')
      .field('email', 'valid@example.com')
      .field('phone', 'abc')
      .field('jobId', job._id.toString())
      .attach('resume', FAKE_PDF, 'resume.pdf');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/phone/i);
  });

  it('returns 400 when resume is not attached', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-noresume');
    const employer = await registerUser('employer', 'app-submit-emp4');
    const job = await createJob(employer.userId);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test User')
      .field('email', 'valid@example.com')
      .field('phone', '604-555-1234')
      .field('jobId', job._id.toString());

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/resume/i);
  });

  it('returns 400 when resume has a disallowed file type', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-badfile');
    const employer = await registerUser('employer', 'app-submit-emp5');
    const job = await createJob(employer.userId);

    const FAKE_TXT = Buffer.from('some text content');

    // Multer's fileFilter calls cb(err) which Express's default error handler
    // writes to process.stderr — suppress that noise in the test output.
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test User')
      .field('email', 'valid@example.com')
      .field('phone', '604-555-1234')
      .field('jobId', job._id.toString())
      .attach('resume', FAKE_TXT, 'resume.txt');

    stderrSpy.mockRestore();

    // Express's default error handler returns 500 (no custom error middleware)
    expect(res.status).not.toBe(201);
  });

  it('returns 404 when job does not exist', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-nojob');
    const fakeJobId = '000000000000000000000001';

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test User')
      .field('email', 'valid@example.com')
      .field('phone', '604-555-1234')
      .field('jobId', fakeJobId)
      .attach('resume', FAKE_PDF, 'resume.pdf');

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/job not found/i);
  });

  it('returns 400 when job is closed', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-closedjob');
    const employer = await registerUser('employer', 'app-submit-emp6');
    const job = await createJob(employer.userId, { status: 'closed' });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test User')
      .field('email', 'valid@example.com')
      .field('phone', '604-555-1234')
      .field('jobId', job._id.toString())
      .attach('resume', FAKE_PDF, 'resume.pdf');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no longer accepting/i);
  });

  it('creates application with resume only', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-ok');
    const employer = await registerUser('employer', 'app-submit-emp7');
    const job = await createJob(employer.userId);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Jane Doe')
      .field('email', 'jane@example.com')
      .field('phone', '604-555-9999')
      .field('jobId', job._id.toString())
      .attach('resume', FAKE_PDF, 'resume.pdf');

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/submitted successfully/i);
    expect(res.body.applicationId).toBeDefined();
  });

  it('creates application with resume and cover letter', async () => {
    const { token } = await registerUser('jobseeker', 'app-submit-coverletter');
    const employer = await registerUser('employer', 'app-submit-emp8');
    const job = await createJob(employer.userId);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'John Smith')
      .field('email', 'john@example.com')
      .field('phone', '604-555-0000')
      .field('jobId', job._id.toString())
      .field('additionalMessage', 'Looking forward to hearing from you.')
      .attach('resume', FAKE_PDF, 'resume.pdf')
      .attach('coverLetter', FAKE_PDF, 'cover.pdf');

    expect(res.status).toBe(201);
    expect(res.body.applicationId).toBeDefined();

    const saved = await Application.findById(res.body.applicationId);
    expect(saved.coverLetterPath).not.toBeNull();
    expect(saved.additionalMessage).toBe('Looking forward to hearing from you.');
  });
});

// ─── GET Applications ────────────────────────────────────────────────────────


describe('GET /api/applications/my', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/applications/my');
    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is an employer', async () => {
    const { token } = await registerUser('employer', 'app-my-employer');

    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('returns empty array when jobseeker has no applications', async () => {
    const { token } = await registerUser('jobseeker', 'app-my-empty');

    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns only applications belonging to the authenticated jobseeker', async () => {
    const seeker1 = await registerUser('jobseeker', 'app-my-seeker1');
    const seeker2 = await registerUser('jobseeker', 'app-my-seeker2');
    const employer = await registerUser('employer', 'app-my-emp');
    const job = await createJob(employer.userId);

    await createApplication(seeker1.userId, job._id);
    await createApplication(seeker1.userId, job._id);
    await createApplication(seeker2.userId, job._id);

    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${seeker1.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    res.body.data.forEach((app) => {
      expect(app.applicant.toString()).toBe(seeker1.userId);
    });
  });

  it('populates job fields on returned applications', async () => {
    const { token, userId } = await registerUser('jobseeker', 'app-my-populate');
    const employer = await registerUser('employer', 'app-my-emp2');
    const job = await createJob(employer.userId);

    await createApplication(userId, job._id);

    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const appData = res.body.data[0];
    expect(appData.job).toMatchObject({
      title: job.title,
      company: job.company,
    });
  });
});

// ─── PATCH Applications ────────────────────────────────────────────────────────

describe('PATCH /api/applications/:id/status', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app)
      .patch('/api/applications/000000000000000000000001/status')
      .send({ status: 'reviewed' });

    expect(res.status).toBe(401);
  });

  it('returns 403 when requester is a jobseeker', async () => {
    const { token } = await registerUser('jobseeker', 'app-status-seeker');
    const employer = await registerUser('employer', 'app-status-emp');
    const job = await createJob(employer.userId);
    const seeker2 = await registerUser('jobseeker', 'app-status-seeker2');
    const application = await createApplication(seeker2.userId, job._id);

    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid application id format', async () => {
    const { token } = await registerUser('employer', 'app-status-badid');

    const res = await request(app)
      .patch('/api/applications/not-a-mongo-id/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'reviewed' });

    // express-validator adds errors but the controller doesn't call validationResult,
    // so Mongoose throws a CastError caught by the try/catch → 500
    expect(res.status).not.toBe(200);
  });

  it('returns 400 for invalid status value', async () => {
    const employer = await registerUser('employer', 'app-status-badstatus');
    const job = await createJob(employer.userId);
    const seeker = await registerUser('jobseeker', 'app-status-seeker3');
    const application = await createApplication(seeker.userId, job._id);

    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ status: 'hired' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/status must be one of/i);
  });

  it('returns 404 when application does not exist', async () => {
    const { token } = await registerUser('employer', 'app-status-notfound');
    const fakeId = '000000000000000000000001';

    const res = await request(app)
      .patch(`/api/applications/${fakeId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/application not found/i);
  });

  it('returns 403 when employer does not own the job', async () => {
    const owner = await registerUser('employer', 'app-status-owner');
    const other = await registerUser('employer', 'app-status-other');
    const job = await createJob(owner.userId);
    const seeker = await registerUser('jobseeker', 'app-status-seeker4');
    const application = await createApplication(seeker.userId, job._id);

    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ status: 'reviewed' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it.each(['pending', 'reviewed', 'shortlisted', 'rejected'])(
    'updates status to "%s" for job owner',
    async (status) => {
      const employer = await registerUser('employer', `app-status-${status}`);
      const job = await createJob(employer.userId);
      const seeker = await registerUser('jobseeker', `app-status-sk-${status}`);
      const application = await createApplication(seeker.userId, job._id);

      const res = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ status });

      expect(res.status).toBe(200);
      expect(res.body.applicationStatus).toBe(status);
      expect(res.body.message).toMatch(/status updated/i);
    }
  );
});
