const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

// ---- GET /users ----
test('GET /users returns seeded users with id, name, email', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ]);
});

test('GET /users includes newly created users', async () => {
  await request(app).post('/users').send({ name: 'G', email: 'g@x.com' });
  const res = await request(app).get('/users');
  assert.equal(res.body.length, 3);
});

// ---- GET /users/:id ----
test('GET /users/:id returns the matching user', async () => {
  const res = await request(app).get('/users/2');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 2, name: 'Alan Turing', email: 'alan@example.com' });
});

test('GET /users/:id 404 body is { error }', async () => {
  const res = await request(app).get('/users/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

for (const bad of ['abc', '0', '-1', '1.5', '1abc']) {
  test(`GET /users/${bad} returns 404`, async () => {
    const res = await request(app).get(`/users/${bad}`);
    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { error: 'User not found' });
  });
}

// ---- POST /users ----
test('POST /users returns created user with sequential id and persists it', async () => {
  const res = await request(app).post('/users').send({ name: 'Grace', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 3, name: 'Grace', email: 'grace@example.com' });
  const get = await request(app).get('/users/3');
  assert.equal(get.status, 200);
  assert.equal(get.body.name, 'Grace');
});

test('POST /users assigns distinct incrementing ids', async () => {
  const a = await request(app).post('/users').send({ name: 'A', email: 'a@x.com' });
  const b = await request(app).post('/users').send({ name: 'B', email: 'b@x.com' });
  assert.equal(b.body.id, a.body.id + 1);
});

test('POST /users ignores client-supplied id and extra fields', async () => {
  const res = await request(app)
    .post('/users')
    .send({ id: 99, name: 'X', email: 'x@x.com', admin: true });
  assert.equal(res.status, 201);
  assert.equal(res.body.id, 3);
  assert.equal(res.body.admin, undefined);
});

test('POST /users 400 when name missing', async () => {
  const res = await request(app).post('/users').send({ email: 'a@x.com' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users 400 when email missing', async () => {
  const res = await request(app).post('/users').send({ name: 'A' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users 400 for empty body', async () => {
  const res = await request(app).post('/users').send({});
  assert.equal(res.status, 400);
});

test('POST /users 400 when no body/content-type is sent', async () => {
  const res = await request(app).post('/users');
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users 400 for empty-string fields', async () => {
  const res = await request(app).post('/users').send({ name: '', email: '' });
  assert.equal(res.status, 400);
});

test('POST /users 400 failure does not create a user', async () => {
  await request(app).post('/users').send({ name: 'A' });
  const res = await request(app).get('/users');
  assert.equal(res.body.length, 2);
});

test('POST /users with malformed JSON returns 400', async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{"name": ');
  assert.equal(res.status, 400);
});

// ---- PUT /users/:id ----
test('PUT /users/:id updates name only, leaving email', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada L.', email: 'ada@example.com' });
});

test('PUT /users/:id updates email only, leaving name', async () => {
  const res = await request(app).put('/users/1').send({ email: 'new@x.com' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada Lovelace', email: 'new@x.com' });
});

test('PUT /users/:id updates both and persists', async () => {
  await request(app).put('/users/2').send({ name: 'N', email: 'n@x.com' });
  const res = await request(app).get('/users/2');
  assert.deepEqual(res.body, { id: 2, name: 'N', email: 'n@x.com' });
});

test('PUT /users/:id cannot change id', async () => {
  const res = await request(app).put('/users/1').send({ id: 50, name: 'Z' });
  assert.equal(res.status, 200);
  assert.equal(res.body.id, 1);
});

test('PUT /users/:id 400 when neither name nor email given', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
});

test('PUT /users/:id 400 when no body is sent', async () => {
  const res = await request(app).put('/users/1');
  assert.equal(res.status, 400);
});

test('PUT /users/:id 404 body is { error }', async () => {
  const res = await request(app).put('/users/999').send({ name: 'N' });
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('PUT /users/abc returns 404', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'N' });
  assert.equal(res.status, 404);
});

test('PUT validation (400) takes precedence over 404', async () => {
  const res = await request(app).put('/users/999').send({});
  assert.equal(res.status, 400);
});

test('PUT /users/:id with malformed JSON returns 400', async () => {
  const res = await request(app)
    .put('/users/1')
    .set('Content-Type', 'application/json')
    .send('{bad');
  assert.equal(res.status, 400);
});

// ---- unsupported methods ----
test('DELETE /users/:id is not implemented (404)', async () => {
  const res = await request(app).delete('/users/1');
  assert.equal(res.status, 404);
});

// ---- Suspected bugs / gaps: expected-correct behavior, marked todo so they
// report without failing the suite. Remove `todo` once the API is fixed. ----
test('POST /users rejects non-string name/email (suspected bug)', { todo: true }, async () => {
  const res = await request(app).post('/users').send({ name: 123, email: { a: 1 } });
  assert.equal(res.status, 400);
});

test('POST /users rejects invalid email format (suspected gap)', { todo: true }, async () => {
  const res = await request(app).post('/users').send({ name: 'A', email: 'not-an-email' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id rejects empty-string name (suspected bug)', { todo: true }, async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id rejects null name (suspected bug)', { todo: true }, async () => {
  const res = await request(app).put('/users/1').send({ name: null });
  assert.equal(res.status, 400);
});

test('malformed JSON error is JSON { error } (suspected convention violation)', { todo: true }, async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{"name": ');
  assert.match(res.headers['content-type'], /json/);
  assert.ok(res.body.error);
});

test('POST /users rejects duplicate email (suspected gap)', { todo: true }, async () => {
  const res = await request(app).post('/users').send({ name: 'Dup', email: 'ada@example.com' });
  assert.equal(res.status, 409);
});
