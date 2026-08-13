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

test('GET /users/:id returns 400 for a malformed id', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('PUT /users/:id returns 400 for a malformed id', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'Nobody' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /users rejects an empty-string name', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '', email: 'blank@example.com' });
  assert.equal(res.status, 400);
});

test('POST /users rejects a non-string name', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 123, email: 'number@example.com' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id rejects an empty-string name and does not corrupt the record', async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);

  const stillIntact = await request(app).get('/users/1');
  assert.equal(stillIntact.body.name, 'Ada Lovelace');
});

test('PUT /users/:id rejects a null name', async () => {
  const res = await request(app).put('/users/1').send({ name: null });
  assert.equal(res.status, 400);
});

test('PUT /users/:id rejects a non-string email', async () => {
  const res = await request(app).put('/users/1').send({ email: 12345 });
  assert.equal(res.status, 400);
});

test('GET /nonexistent-route returns a JSON 404', async () => {
  const res = await request(app).get('/nonexistent-route');
  assert.equal(res.status, 404);
  assert.ok(res.body.error);
});

test('POST /users with malformed JSON body returns a JSON 400', async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{"name": "Broken",');
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});
