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
  assert.equal(typeof res.body.error, 'string');
});

test('GET /users/:id returns the matching user', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.ok(res.body.id);
});

test('POST /users persists the new user and increments the id from the seeded nextId', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.id, 3);

  const listRes = await request(app).get('/users');
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.length, 3);
  assert.deepEqual(listRes.body[2], {
    id: 3,
    name: 'Grace Hopper',
    email: 'grace@example.com',
  });
});

test('POST /users returns 400 when name is missing', async () => {
  const res = await request(app)
    .post('/users')
    .send({ email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 for an empty body', async () => {
  const res = await request(app).post('/users').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
});

test('PUT /users/:id updates only the email when only email is sent', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: 'ada.lovelace@example.com' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada.lovelace@example.com',
  });
});

test('PUT /users/:id updates both name and email when both are sent', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 'Ada L.', email: 'ada.l@example.com' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    name: 'Ada L.',
    email: 'ada.l@example.com',
  });
});

test('PUT /users/:id returns 400 when neither name nor email is sent', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
  assert.equal(typeof res.body.error, 'string');
});
