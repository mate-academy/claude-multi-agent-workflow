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
  assert.deepEqual(res.body[0], {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
  });
});

test('GET /users/:id returns the user for an existing id', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
  });
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
  const res = await request(app).post('/users').send({ email: 'x@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
  assert.deepEqual(Object.keys(res.body), ['error']);
});

test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'No Email' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
  assert.deepEqual(Object.keys(res.body), ['error']);
});

test('POST /users returns 400 when both fields are missing', async () => {
  const res = await request(app).post('/users').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 for an empty-string name', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '', email: 'blank@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users does not add a user when validation fails', async () => {
  await request(app).post('/users').send({ name: 'No Email' });
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 2);
});

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    name: 'Ada L.',
    email: 'ada@example.com',
  });
});

test('PUT /users/:id updates only the email when only email is given', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: 'ada@newdomain.com' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@newdomain.com',
  });
});

test('PUT /users/:id updates both fields in one call', async () => {
  const res = await request(app)
    .put('/users/2')
    .send({ name: 'Alan M. Turing', email: 'alan@bletchley.example.com' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 2,
    name: 'Alan M. Turing',
    email: 'alan@bletchley.example.com',
  });
});

test('PUT /users/:id returns 400 for an empty body', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
  assert.deepEqual(Object.keys(res.body), ['error']);
});

test('PUT /users/:id rejects an empty-string name, consistent with POST', async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');

  const after = await request(app).get('/users/1');
  assert.equal(after.body.name, 'Ada Lovelace');
});

test('PUT /users/:id rejects an empty-string email, consistent with POST', async () => {
  const res = await request(app).put('/users/1').send({ email: '' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');

  const after = await request(app).get('/users/1');
  assert.equal(after.body.email, 'ada@example.com');
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

test('POST /users returns 400 { error } for a malformed JSON body', async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{"name": "broken"');
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
  assert.deepEqual(Object.keys(res.body), ['error']);
});

test('PUT /users/:id returns 400 { error } for a malformed JSON body', async () => {
  const res = await request(app)
    .put('/users/1')
    .set('Content-Type', 'application/json')
    .send('{"name": "broken"');
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
  assert.deepEqual(Object.keys(res.body), ['error']);
});
