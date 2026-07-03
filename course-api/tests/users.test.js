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

test('POST /users with only name returns 400 with the error shape', async () => {
  const res = await request(app).post('/users').send({ name: 'No Email' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users with only email returns 400 with the error shape', async () => {
  const res = await request(app).post('/users').send({ email: 'no-name@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /users/:id with an empty body returns 400 with the error shape', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users rejects a non-string name (real defect: no type validation)', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 123, email: 'x@example.com' });
  assert.equal(res.status, 400);
});

test('POST /users rejects a non-string email (real defect: no type validation)', async () => {
  const res = await request(app).post('/users').send({ name: 'X', email: {} });
  assert.equal(res.status, 400);
});

test('PUT /users/:id rejects an empty-string field (real defect: no type validation)', async () => {
  const res = await request(app).put('/users/1').send({ email: '' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id rejects a null field (real defect: no type validation)', async () => {
  const res = await request(app).put('/users/1').send({ email: null });
  assert.equal(res.status, 400);
});

test('POST /users with an unparsable JSON body returns 400 with the error shape', async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{oops');
  assert.equal(res.status, 400);
  // docs/api.md promises `{ "error": "message" }` for all errors, but this
  // path is unhandled by the app and falls through to Express's default
  // HTML error page, so the body is not JSON.
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users with no content type and no body returns 400, not a crash', async () => {
  const res = await request(app).post('/users');
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('GET /users/:id with a non-numeric id returns 404', async () => {
  // docs/api.md does not specify behavior for a non-numeric id; 400 would
  // arguably be more correct, but this asserts the current behavior.
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 404);
});

test('PUT /users/:id with a non-numeric id returns 404', async () => {
  // Same ambiguity as GET /users/:id above.
  const res = await request(app).put('/users/abc').send({ name: 'X' });
  assert.equal(res.status, 404);
});

test('GET on an undefined route returns a JSON error body', async () => {
  const res = await request(app).get('/nope');
  assert.equal(res.status, 404);
  // docs/api.md states errors come back as `{ "error": "message" }` with no
  // scoping to specific routes; Express's default 404 handler returns HTML
  // instead, so this fails against the documented contract.
  assert.equal(typeof res.body.error, 'string');
});

test('DELETE on an unsupported method returns a JSON error body', async () => {
  const res = await request(app).delete('/users/1');
  assert.equal(res.status, 404);
  // Same documented-but-unimplemented JSON error shape as above.
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users ignores a client-supplied id', async () => {
  const res = await request(app)
    .post('/users')
    .send({ id: 999, name: 'X', email: 'x@example.com' });
  assert.equal(res.status, 201);
  assert.notEqual(res.body.id, 999);
});

test('sequential POST /users calls produce unique, incrementing, retrievable ids', async () => {
  const first = await request(app)
    .post('/users')
    .send({ name: 'First', email: 'first@example.com' });
  const second = await request(app)
    .post('/users')
    .send({ name: 'Second', email: 'second@example.com' });

  assert.ok(second.body.id > first.body.id);

  const getFirst = await request(app).get(`/users/${first.body.id}`);
  const getSecond = await request(app).get(`/users/${second.body.id}`);
  assert.equal(getFirst.body.name, 'First');
  assert.equal(getSecond.body.name, 'Second');
});
