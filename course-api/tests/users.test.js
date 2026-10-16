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

test('GET /users/:id returns an existing user', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
});

test('GET /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).get('/users/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('GET /users/:id returns 404 for a non-numeric id', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.equal(res.body.email, 'grace@example.com');
  assert.ok(res.body.id);
});

test('POST /users returns 400 when name is missing', async () => {
  const res = await request(app)
    .post('/users')
    .send({ email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users returns 400 when both name and email are missing', async () => {
  const res = await request(app).post('/users').send({});
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users returns 400 when name is an empty string', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '', email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
});

test('PUT /users/:id updates only the email', async () => {
  const res = await request(app).put('/users/1').send({ email: 'ada.l@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ada.l@example.com');
  assert.equal(res.body.name, 'Ada Lovelace');
});

test('PUT /users/:id updates both name and email', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 'Ada L.', email: 'ada.l@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'ada.l@example.com');
});

test('PUT /users/:id returns 400 when neither name nor email is provided', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('PUT /users/:id returns 404 for a non-numeric id', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('PUT /users/:id returns 400 when name is an empty string', async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
});
