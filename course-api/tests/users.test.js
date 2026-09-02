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

// Finding 1: Malformed ID coercion should return 400, not 404
test('GET /users/:id returns 400 for a malformed (non-numeric) ID', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('PUT /users/:id returns 400 for a malformed (non-numeric) ID', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'New Name' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

// Finding 2: Empty-string values should be rejected (inconsistent with POST)
test('PUT /users/:id returns 400 when name is an empty string', async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('PUT /users/:id returns 400 when email is an empty string', async () => {
  const res = await request(app).put('/users/1').send({ email: '' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

// Finding 3: Non-string values for name/email should be rejected
test('POST /users returns 400 when name is not a string', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 42, email: 'test@example.com' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /users returns 400 when email is not a string', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test User', email: 123 });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('PUT /users/:id returns 400 when name is not a string', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 42 });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('PUT /users/:id returns 400 when email is not a string', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: 123 });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});
