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

test('GET /users/:id returns the correct user for a valid id', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
});

test('GET /health returns status ok and an uptime', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.uptime, 'number');
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.ok(res.body.id);
});

test('POST /users with only name returns 400', async () => {
  const res = await request(app).post('/users').send({ name: 'Grace Hopper' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /users with only email returns 400', async () => {
  const res = await request(app).post('/users').send({ email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
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

test('PUT /users/:id with an empty name returns 400', async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('PUT /users/:id with only email updates just the email', async () => {
  const res = await request(app).put('/users/1').send({ email: 'ada.lovelace@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ada.lovelace@example.com');
  assert.equal(res.body.name, 'Ada Lovelace');
});

test('PUT /users/:id with both name and email updates both', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 'Ada L.', email: 'ada.l@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'ada.l@example.com');
});
