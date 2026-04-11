import request from 'supertest';
import app from '../app.js';

async function registerAndGetToken(overrides = {}) {
  const unique = Date.now() + Math.random().toString(36).slice(2);
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: `profile-${unique}@example.com`,
      password: 'password123',
      ...overrides,
    });
  return { token: res.body.token, user: res.body.user };
}

// ─── GET /api/profile ────────────────────────────────────────────────────────

describe('GET /api/profile', () => {
  it('returns 200 with profile data for authenticated user', async () => {
    const { token, user } = await registerAndGetToken();

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user.id);
    expect(res.body.email).toBe(user.email);
    expect(res.body.name).toBe(user.name);
    expect(res.body.role).toBe('jobseeker');
    expect(res.body.profile).toBeDefined();
    expect(res.body.password).toBeUndefined();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
  });
});

// ─── PUT /api/profile (jobseeker) ────────────────────────────────────────────

describe('PUT /api/profile — jobseeker', () => {
  let token;

  beforeEach(async () => {
    ({ token } = await registerAndGetToken({ role: 'jobseeker' }));
  });

  it('returns 200 and updates name', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  it('returns 200 and updates jobseeker profile fields', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        profile: {
          phone: '+1 555-123-4567',
          location: 'Vancouver, BC',
          bio: 'Looking for new opportunities',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.profile.phone).toBe('+1 555-123-4567');
    expect(res.body.profile.location).toBe('Vancouver, BC');
    expect(res.body.profile.bio).toBe('Looking for new opportunities');
  });

  it('returns 200 and ignores employer-only fields for jobseeker', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Seeker',
        profile: {
          companyName: 'Acme Corp',
          bio: 'My bio',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Seeker');
    expect(res.body.profile.bio).toBe('My bio');
    expect(res.body.profile.companyName).toBeUndefined();
  });

  it('returns 400 when name is an empty string', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when bio exceeds 500 characters', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: { bio: 'x'.repeat(501) } });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when phone number format is invalid', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: { phone: 'not-a-phone' } });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when no valid fields are provided', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no valid fields/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .put('/api/profile')
      .send({ name: 'No Auth' });

    expect(res.status).toBe(401);
  });
});

// ─── PUT /api/profile (employer) ─────────────────────────────────────────────

describe('PUT /api/profile — employer', () => {
  let token;

  beforeEach(async () => {
    ({ token } = await registerAndGetToken({ role: 'employer' }));
  });

  it('returns 200 and updates employer profile fields', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Employer Name',
        profile: {
          companyName: 'Acme Corp',
          industry: 'Technology',
          companySize: '11-50',
          websiteUrl: 'https://acme.example.com',
          companyLocation: 'Seattle, WA',
          contactEmail: 'hr@acme.example.com',
          companyDescription: 'We build things.',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Employer Name');
    expect(res.body.profile.companyName).toBe('Acme Corp');
    expect(res.body.profile.industry).toBe('Technology');
    expect(res.body.profile.companySize).toBe('11-50');
    expect(res.body.profile.websiteUrl).toBe('https://acme.example.com');
    expect(res.body.profile.companyLocation).toBe('Seattle, WA');
    expect(res.body.profile.contactEmail).toBe('hr@acme.example.com');
    expect(res.body.profile.companyDescription).toBe('We build things.');
  });

  it('returns 200 and ignores jobseeker-only fields for employer', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Employer',
        profile: {
          location: 'Remote',
          bio: 'My bio',
          companyName: 'Acme Corp',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Employer');
    expect(res.body.profile.companyName).toBe('Acme Corp');
    expect(res.body.profile.location).toBeUndefined();
    expect(res.body.profile.bio).toBeUndefined();
  });

  it('returns 400 when companySize is not an allowed value', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: { companySize: '999' } });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when websiteUrl is not a valid URL', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: { websiteUrl: 'not-a-url' } });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when contactEmail is not a valid email', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: { contactEmail: 'not-an-email' } });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when no valid fields are provided', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no valid fields/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .put('/api/profile')
      .send({ profile: { companyName: 'Acme' } });

    expect(res.status).toBe(401);
  });
});
