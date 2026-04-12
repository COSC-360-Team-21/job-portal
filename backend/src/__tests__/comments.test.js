import request from 'supertest';
import app from '../app.js';
import { registerUser, createJob } from './helpers.js';

describe('Comments API', () => {
  let seekerToken, employerToken, seekerUserId, jobId;

  beforeEach(async () => {
    const seeker = await registerUser('jobseeker');
    seekerToken = seeker.token;
    seekerUserId = seeker.userId;
    const employer = await registerUser('employer');
    employerToken = employer.token;
    const job = await createJob(employer.userId);
    jobId = job._id.toString();
  });

  describe('POST /api/comments', () => {
    it('creates a comment on a job', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId, content: 'Great opportunity!' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('content', 'Great opportunity!');
      expect(res.body).toHaveProperty('author');
    });

    it('rejects comment without auth', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({ jobId, content: 'test' });
      expect(res.status).toBe(401);
    });

    it('rejects empty content', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId, content: '' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid job id', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId: 'not-a-valid-id', content: 'test' });
      expect(res.status).toBe(400);
    });

    it('creates a reply to a comment', async () => {
      const parent = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId, content: 'Parent comment' });

      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ jobId, content: 'Reply here', parentCommentId: parent.body._id });
      expect(res.status).toBe(201);
      expect(res.body.parentComment).toBe(parent.body._id);
    });
  });

  describe('GET /api/comments/job/:jobId', () => {
    it('returns empty list for job with no comments', async () => {
      const res = await request(app).get(`/api/comments/job/${jobId}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toBeDefined();
    });

    it('returns comments with replies included', async () => {
      const parent = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId, content: 'Top-level comment' });

      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ jobId, content: 'A reply', parentCommentId: parent.body._id });

      const res = await request(app).get(`/api/comments/job/${jobId}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].replies).toHaveLength(1);
    });

    it('does not require auth (public endpoint)', async () => {
      const res = await request(app).get(`/api/comments/job/${jobId}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/comments/mine', () => {
    it('returns only current user comments', async () => {
      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId, content: 'My comment' });

      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ jobId, content: 'Other user comment' });

      const res = await request(app)
        .get('/api/comments/mine')
        .set('Authorization', `Bearer ${seekerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].content).toBe('My comment');
    });

    it('rejects without auth', async () => {
      const res = await request(app).get('/api/comments/mine');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('deletes own comment', async () => {
      const comment = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId, content: 'To be deleted' });

      const res = await request(app)
        .delete(`/api/comments/${comment.body._id}`)
        .set('Authorization', `Bearer ${seekerToken}`);
      expect(res.status).toBe(200);
    });

    it('cannot delete another user comment', async () => {
      const comment = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId, content: 'Not yours' });

      const res = await request(app)
        .delete(`/api/comments/${comment.body._id}`)
        .set('Authorization', `Bearer ${employerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/comments/hot', () => {
    it('returns hot discussions (public)', async () => {
      const res = await request(app).get('/api/comments/hot');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
