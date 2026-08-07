const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /users returns the seeded list', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).get('/users/999');
  assert.equal(res.status, 404);
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.ok(res.body.id);
});

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
});

test('PUT /users/:id rejects an empty-string name', async () => {
  // POST /users rejects falsy/empty values via `!name || !email`, but PUT
  // only checks `name === undefined && email === undefined`, so an empty
  // string currently passes validation and silently blanks the name.
  // This test documents the expected behavior and will fail until PUT
  // validation is made consistent with POST (routes/users.js:32-35).
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'name or email is required');
});

test('PUT /users/:id rejects an empty-string email', async () => {
  // Same inconsistency as above, but for the email field: an empty string
  // currently passes PUT's validation and would silently blank the email.
  const res = await request(app).put('/users/1').send({ email: '' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'name or email is required');
});

test('GET /users/:id returns 404 for a non-numeric id', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 404);
});
