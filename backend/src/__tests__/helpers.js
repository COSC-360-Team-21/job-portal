import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../app.js';
import Job from '../models/Job.js';

export const WORK_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

export async function registerUser(role = 'jobseeker') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: faker.person.fullName(),
      email: `${faker.string.uuid()}@example.com`,
      password: 'password123',
      role,
    });
  return { token: res.body.token, userId: res.body.user.id };
}

export function buildJobPayload(overrides = {}) {
  return {
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    location: `${faker.location.city()}, ${faker.location.countryCode()}`,
    description: faker.lorem.sentence(),
    requirements: [faker.person.jobArea(), faker.helpers.arrayElement(['Node.js', 'React', 'MongoDB'])],
    salaryRange: `${faker.number.int({ min: 50, max: 90 })}k-${faker.number.int({ min: 91, max: 180 })}k`,
    workType: faker.helpers.arrayElement(WORK_TYPES),
    ...overrides,
  };
}

export function createJob(userId, overrides = {}) {
  return Job.create({
    ...buildJobPayload(),
    postedBy: userId,
    ...overrides,
  });
}
