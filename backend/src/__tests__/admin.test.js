import request from 'supertest';
import app from '../app.js';
import { registerUser, createJob } from './helpers.js';
import User from '../models/User.js';

async function registerAdmin() {
  const admin = await registerUser('jobseeker');
  await User.findByIdAndUpdate(admin.userId, { role: 'admin' });
  // Re-login to get a token with the admin user
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${admin.token}`);
  return { token: admin.token, userId: admin.userId };
}

describe('Admin API', () => {
  let adminToken, seekerToken, employerToken, seekerUserId, employerUserId;

  beforeEach(async () => {
    const admin = await registerAdmin();
    adminToken = admin.token;
    const seeker = await registerUser('jobseeker');
    seekerToken = seeker.token;
    seekerUserId = seeker.userId;
    const employer = await registerUser('employer');
    employerToken = employer.token;
    employerUserId = employer.userId;
  });

  describe('GET /api/admin/stats', () => {
    it('returns stats for admin', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.users).toBeDefined();
      expect(res.body.users.total).toBeGreaterThanOrEqual(3);
      expect(res.body.jobs).toBeDefined();
      expect(res.body.applications).toBeDefined();
      expect(res.body.comments).toBeDefined();
    });

    it('rejects non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${seekerToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/activity', () => {
    it('returns activity data', async () => {
      const res = await request(app)
        .get('/api/admin/activity?days=30')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('registrations');
      expect(res.body).toHaveProperty('jobs');
      expect(res.body).toHaveProperty('applications');
      expect(res.body).toHaveProperty('comments');
    });
  });

  describe('GET /api/admin/users', () => {
    it('lists all users', async () => {
      const res = await request(app)
        .get('/api/admin/users?limit=100')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.pagination).toBeDefined();
    });

    it('filters by role', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=employer')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.forEach((u) => expect(u.role).toBe('employer'));
    });
  });

  describe('PATCH /api/admin/users/:id/toggle-active', () => {
    it('disables a user', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${seekerUserId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.isActive).toBe(false);
    });

    it('re-enables a disabled user', async () => {
      await request(app)
        .patch(`/api/admin/users/${seekerUserId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);
      const res = await request(app)
        .patch(`/api/admin/users/${seekerUserId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.isActive).toBe(true);
    });

    it('rejects non-admin', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${seekerUserId}/toggle-active`)
        .set('Authorization', `Bearer ${seekerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('deletes a user', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${seekerUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('rejects non-admin', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${seekerUserId}`)
        .set('Authorization', `Bearer ${seekerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/jobs', () => {
    it('lists all jobs for admin', async () => {
      await createJob(employerUserId);
      await createJob(employerUserId);
      const res = await request(app)
        .get('/api/admin/jobs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('DELETE /api/admin/jobs/:id', () => {
    it('deletes a job', async () => {
      const job = await createJob(employerUserId);
      const res = await request(app)
        .delete(`/api/admin/jobs/${job._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/admin/applications', () => {
    it('lists all applications for admin', async () => {
      const res = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });
  });
});
