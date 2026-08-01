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

test('GET /users/:id returns the matching user', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada Lovelace');
  assert.equal(res.body.email, 'ada@example.com');
});

test('GET /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).get('/users/999');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'User not found');
});

test('GET /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'id must be a number');
});

test('GET /users/:id returns 400 for a non-integer id', async () => {
  const res = await request(app).get('/users/1.5');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'id must be a number');
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.equal(res.body.email, 'grace@example.com');
  // Seed leaves nextId at 3, so the first user created in a fresh test is 3.
  assert.equal(res.body.id, 3);
});

test('POST /users trims the name before storing it', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '  Grace Hopper  ', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
});

test('POST /users returns 400 when name or email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'No Email' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'name and a valid email are required');
});

test('POST /users returns 400 for a malformed email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Bad Email', email: 'not-an-email' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'name and a valid email are required');
});

test('POST /users returns 400 for a duplicate email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Second Ada', email: 'ada@example.com' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'email is already in use');
});

test('POST /users returns 400 for a duplicate email regardless of case', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Second Ada', email: 'ADA@example.com' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'email is already in use');
});

test('PUT /users/:id updates the name and preserves the email', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'ada@example.com');
});

test('PUT /users/:id updates the email and preserves the name', async () => {
  const res = await request(app).put('/users/1').send({ email: 'ada.l@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada Lovelace');
  assert.equal(res.body.email, 'ada.l@example.com');
});

test('PUT /users/:id updates both name and email together', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 'Ada L.', email: 'ada.l@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'ada.l@example.com');
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'User not found');
});

test('PUT /users/:id returns 400 when neither name nor email is given', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'name or email is required');
});

test('PUT /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'Nobody' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'id must be a number');
});

test('PUT /users/:id returns 400 for an invalid name', async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'name must be a non-empty string');
});

test('PUT /users/:id returns 400 for an invalid email', async () => {
  const res = await request(app).put('/users/1').send({ email: 'not-an-email' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'email must be a valid email address');
});

test('PUT /users/:id returns 400 when the email belongs to another user', async () => {
  const res = await request(app).put('/users/1').send({ email: 'alan@example.com' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'email is already in use');
});

test('PUT /users/:id allows a user to keep their own email', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 'Ada L.', email: 'ada@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ada@example.com');
});

test('GET /nonexistent-route returns a JSON 404', async () => {
  const res = await request(app).get('/nonexistent-route');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not found');
});
