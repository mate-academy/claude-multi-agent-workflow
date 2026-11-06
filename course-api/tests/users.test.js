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

// ---- Behavior that works today ----

test('GET /users/:id returns the user when it exists', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
  });
});

test('POST /users returns 400 when name is missing', async () => {
  const res = await request(app)
    .post('/users')
    .send({ email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'Grace Hopper' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /users returns 400 for empty-string name', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '', email: 'grace@example.com' });
  assert.equal(res.status, 400);
});

test('POST /users returns 400 for empty-string email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: '' });
  assert.equal(res.status, 400);
});

test('POST /users returns 400 for null name or email', async () => {
  const res1 = await request(app)
    .post('/users')
    .send({ name: null, email: 'grace@example.com' });
  assert.equal(res1.status, 400);
  const res2 = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: null });
  assert.equal(res2.status, 400);
});

test('POST /users does not create a user when validation fails', async () => {
  await request(app).post('/users').send({ name: 'Grace Hopper' });
  const res = await request(app).get('/users');
  assert.equal(res.body.length, 2);
});

test('POST /users returns 400 (not 500) when there is no body', async () => {
  const res = await request(app).post('/users');
  assert.equal(res.status, 400);
});

test('POST /users returns 400 (not 500) for an empty JSON object', async () => {
  const res = await request(app).post('/users').send({});
  assert.equal(res.status, 400);
});

test('PUT /users/:id returns 400 when no fields are provided', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('PUT /users/:id returns 400 (not 500) when there is no body', async () => {
  const res = await request(app).put('/users/1');
  assert.equal(res.status, 400);
});

test('PUT /users/:id updates email only and keeps the name', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: 'ada.new@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ada.new@example.com');
  assert.equal(res.body.name, 'Ada Lovelace');
});
