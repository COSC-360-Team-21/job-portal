# API Testing Guide (Backend)

This guide provides a repeatable approach for writing and maintaining backend API tests in this repository.

## Scope

The backend tests in this project are integration-style endpoint tests:
- They call the Express app through Supertest.
- They run against an in-memory MongoDB instance.
- They validate route behavior end-to-end (validation, auth, controller, model writes).

See current setup in `backend/src/__tests__/setup.js`.

## Testing Stack

- Test runner: Vitest
- HTTP assertions: Supertest
- Test database: mongodb-memory-server + Mongoose
- Test data generation: @faker-js/faker

## Core Principles

1. One behavior per test case
- Keep each `it(...)` focused on one expected behavior.
- Multiple `expect(...)` calls are fine if they verify the same behavior.

2. Arrange, Act, Assert pattern
- Arrange: seed data, create tokens, build payloads.
- Act: perform request.
- Assert: check status, response shape, and side effects.

3. Isolated tests
- Do not rely on another test's data.
- Let global cleanup clear collections after each test.

4. Deterministic assertions
- Do not assert exact randomized values unless you set them directly in payload overrides.
- Assert shape, status, and expected semantic fields.

5. Validate both success and failure paths
- Happy path should always be paired with auth/validation/error-path tests.

## Recommended Test Organization

For small resources, keep one file:
- `backend/src/__tests__/jobs.test.js`

When a resource grows, split by method:
- `backend/src/__tests__/jobs.get.test.js`
- `backend/src/__tests__/jobs.post.test.js`
- `backend/src/__tests__/jobs.put.test.js`
- `backend/src/__tests__/jobs.delete.test.js`

Shared helpers should live in:
- `backend/src/__tests__/helpers/` (create this folder when needed)

Example helper files:
- `backend/src/__tests__/helpers/factories.js`
- `backend/src/__tests__/helpers/auth.js`

## Endpoint Coverage Checklist

For every new endpoint, try to cover the following categories:

1. Happy path
- Valid request returns expected status and body.

2. Validation errors
- Missing required fields.
- Invalid types or formats.
- Out-of-range query/path values.

3. Authentication
- Missing token.
- Invalid or malformed token.

4. Authorization
- Wrong role.
- Non-owner trying to modify protected resource.

5. Not found
- Valid ID format but resource does not exist.

6. Pagination, filtering, sorting
- Default behavior.
- Explicit query params.
- Invalid query params.

7. Persistence side effects
- Create actually inserts.
- Update actually changes saved values.
- Delete actually removes resource.

8. Error fallback
- Simulate or guard against unexpected server errors when feasible.

## Test Template

Use this baseline structure for each endpoint behavior:

```js
it('returns 201 for valid payload', async () => {
  // Arrange
  const { token } = await registerUser('employer');
  const payload = buildJobPayload({ workType: 'Full-time' });

  // Act
  const res = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);

  // Assert
  expect(res.status).toBe(201);
  expect(res.body.title).toBe(payload.title);
});
```

## Pagination Testing Pattern

For paginated endpoints, include these three tests at minimum:

1. Default pagination
- No query params.
- Assert default page, limit, and metadata.

2. Custom pagination
- Set `page` and `limit`.
- Assert result length and metadata correctness.

3. Invalid query params
- Send invalid values.
- Assert `400` and validation error payload.

## Faker Best Practices

1. Use helper builders
- `buildJobPayload(overrides)` keeps tests concise and consistent.

2. Override constrained fields explicitly
- If the API expects enum values, pass a valid enum in overrides.

3. Keep generated values realistic but simple
- Random data should improve coverage without making assertions brittle.

## Common Mistakes To Avoid

1. Overloaded test case
- One test checking multiple unrelated behaviors.

2. Weak assertions
- Asserting only status code without validating response structure.

3. Hidden dependencies
- Reusing data from previous tests or relying on execution order.

4. Missing negative paths
- Happy path only with no auth/validation coverage.

## Quality Gate For New Endpoints

Before merging a new endpoint, ensure at least:

1. One happy-path test.
2. One validation-failure test.
3. One auth or authorization test.
4. One not-found or boundary test.

This minimum set catches most regressions early and keeps the suite practical.
