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

test('GET /users/:id returns 200 and the user for an existing id', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
  });
});

test('POST /users returns 400 with { error } when name is missing', async () => {
  const res = await request(app)
    .post('/users')
    .send({ email: 'noname@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 with { error } when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'No Email' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 with { error } when name and email are missing', async () => {
  const res = await request(app).post('/users').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /users/:id returns 400 when neither name nor email is provided', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /users/:id updates the email field and returns the change', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: 'ada.new@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ada.new@example.com');
  // name must remain untouched.
  assert.equal(res.body.name, 'Ada Lovelace');
});

// Documents CURRENT behaviour: a non-numeric id parses to NaN, which matches
// no user, so the route returns 404. Pins behaviour; does NOT change the route.
test('GET /users/:id returns 404 for a non-numeric id (current behaviour)', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 404);
});

test('PUT /users/:id returns 404 for a non-numeric id (current behaviour)', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'X' });
  assert.equal(res.status, 404);
});
