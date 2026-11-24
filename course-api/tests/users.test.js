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

test('POST /users returns 400 for non-string or invalid fields', async () => {
  const bad = [
    { name: 123, email: 'x@example.com' },
    { name: 'Grace', email: 'not-an-email' },
    { name: '   ', email: 'grace@example.com' },
  ];
  for (const body of bad) {
    const res = await request(app).post('/users').send(body);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.ok(res.body.error);
  }
});

test('PUT /users/:id returns 400 instead of blanking a field', async () => {
  for (const body of [{ name: null }, { email: '' }]) {
    const res = await request(app).put('/users/1').send(body);
    assert.equal(res.status, 400, JSON.stringify(body));
  }
  const user = await request(app).get('/users/1');
  assert.equal(user.body.name, 'Ada Lovelace');
  assert.equal(user.body.email, 'ada@example.com');
});

test('malformed JSON returns a JSON 400 error', async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{bad');
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('unknown routes return a JSON 404 error', async () => {
  const res = await request(app).get('/nope');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Not found' });
});
