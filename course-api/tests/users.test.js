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

test('GET /users/:id returns the user', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
});

test('GET /users/:id 404 body has an error message', async () => {
  const res = await request(app).get('/users/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('GET /users/:id returns 400 for a non-numeric id', { todo: true }, async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 with an error body when name is missing', async () => {
  const res = await request(app)
    .post('/users')
    .send({ email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users returns 400 with an error body when email is missing', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users returns 400 JSON when there is no body', async () => {
  const res = await request(app).post('/users');
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users returns 400 JSON for malformed JSON', { todo: true }, async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{"name": "Grace",');
  assert.equal(res.status, 400);
  assert.equal(res.type, 'application/json');
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users persists the created user', async () => {
  const created = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(created.status, 201);

  const fetched = await request(app).get(`/users/${created.body.id}`);
  assert.equal(fetched.status, 200);
  assert.deepEqual(fetched.body, created.body);

  const list = await request(app).get('/users');
  assert.equal(list.body.length, 3);
});

test('POST /users assigns distinct, increasing ids', async () => {
  const first = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  const second = await request(app)
    .post('/users')
    .send({ name: 'Linus Torvalds', email: 'linus@example.com' });
  assert.equal(first.body.id, 3);
  assert.equal(second.body.id, 4);
});

test('POST /users rejects a non-string name', { todo: true }, async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 42, email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users rejects a non-string email', { todo: true }, async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: ['grace@example.com'] });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users rejects a whitespace-only name', { todo: true }, async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '   ', email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('PUT /users/:id updates only the email', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: 'ada.new@example.com' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada Lovelace', email: 'ada.new@example.com' });
});

test('PUT /users/:id updates both name and email', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 'Ada L.', email: 'ada.new@example.com' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada L.', email: 'ada.new@example.com' });
});

test('PUT /users/:id returns 400 with an error body for an empty body', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
});

test('PUT /users/:id 404 body has an error message', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('PUT /users/:id returns 400 for a non-numeric id', { todo: true }, async () => {
  const res = await request(app).put('/users/abc').send({ name: 'Nobody' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /users/:id rejects a null name and leaves the user unchanged', { todo: true }, async () => {
  const res = await request(app).put('/users/1').send({ name: null });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
  const fetched = await request(app).get('/users/1');
  assert.equal(fetched.body.name, 'Ada Lovelace');
});

test('PUT /users/:id rejects an empty-string name and leaves the user unchanged', { todo: true }, async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
  const fetched = await request(app).get('/users/1');
  assert.equal(fetched.body.name, 'Ada Lovelace');
});

test('PUT /users/:id rejects a non-string email and leaves the user unchanged', { todo: true }, async () => {
  const res = await request(app).put('/users/1').send({ email: 42 });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
  const fetched = await request(app).get('/users/1');
  assert.equal(fetched.body.email, 'ada@example.com');
});

test('PUT /users/:id returns 400 JSON for malformed JSON', { todo: true }, async () => {
  const res = await request(app)
    .put('/users/1')
    .set('Content-Type', 'application/json')
    .send('{"name": "Ada",');
  assert.equal(res.status, 400);
  assert.equal(res.type, 'application/json');
  assert.equal(typeof res.body.error, 'string');
});
