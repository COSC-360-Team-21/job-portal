import request from 'supertest';
import app from '../app.js';

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

// Helper: register a user and return the token
async function registerAndGetToken(overrides = {}) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ ...validUser, ...overrides });
  return res.body.token;
}

// ─── Register ────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('returns 201 with token and user on valid input', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.name).toBe(validUser.name);
    expect(res.body.user.role).toBe('jobseeker');
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 201 with employer role when specified', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, role: 'employer' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('employer');
  });

  it('returns 400 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('returns 200 with token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('returns 401 with nonexistent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: validUser.password });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: validUser.password });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ─── Get Me ──────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns 200 with user data for valid token', async () => {
    const token = await registerAndGetToken();

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(validUser.email);
    expect(res.body.name).toBe(validUser.name);
    expect(res.body.password).toBeUndefined();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no token/i);
  });

  it('returns 401 with a malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token invalid/i);
  });

  it('returns 401 with a Bearer header missing the token value', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'NotBearer something');

    expect(res.status).toBe(401);
  });
});

// ─── Change Password ──────────────────────────────────────────────────────────

describe('PUT /api/auth/change-password', () => {
  let token;

  beforeEach(async () => {
    token = await registerAndGetToken();
  });

  it('returns 200 and updates password with valid input', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: validUser.password, newPassword: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/i);
  });

  it('allows login with the new password after change', async () => {
    await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: validUser.password, newPassword: 'newpassword123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'newpassword123' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  it('rejects login with the old password after change', async () => {
    await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: validUser.password, newPassword: 'newpassword123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(loginRes.status).toBe(401);
  });

  it('returns 401 when currentPassword is wrong', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/current password is incorrect/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .send({ currentPassword: validUser.password, newPassword: 'newpassword123' });

    expect(res.status).toBe(401);
  });
});
