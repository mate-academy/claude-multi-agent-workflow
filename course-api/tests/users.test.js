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
});

test('GET /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 400);
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.equal(res.body.email, 'grace@example.com');
  assert.equal(typeof res.body.id, 'number');
});

test('POST /users returns 400 when name or email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'No Email' });
  assert.equal(res.status, 400);
});

test('POST /users returns 400 for a malformed email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Bad Email', email: 'not-an-email' });
  assert.equal(res.status, 400);
});

test('POST /users returns 400 for a duplicate email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Second Ada', email: 'ada@example.com' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'ada@example.com');
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
});

test('PUT /users/:id returns 400 when neither name nor email is given', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
});

test('PUT /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'Nobody' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id returns 400 for an invalid name', async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
});

test('GET /nonexistent-route returns a JSON 404', async () => {
  const res = await request(app).get('/nonexistent-route');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not found');
});
