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

// --- Requirement 1: duplicate emails ---

test('POST /users returns 409 for a duplicate email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Someone', email: 'ada@example.com' });
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, { error: 'email already in use' });
});

test('POST /users returns 409 when the email differs only by case', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Someone', email: 'ADA@Example.com' });
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, { error: 'email already in use' });
});

test('PUT /users/:id returns 409 when another user has the email (case-insensitive)', async () => {
  const res = await request(app).put('/users/1').send({ email: 'ALAN@example.com' });
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, { error: 'email already in use' });
  const check = await request(app).get('/users/1');
  assert.equal(check.body.email, 'ada@example.com');
});

test('PUT /users/:id lets a user keep their own email', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 'Ada L.', email: 'ada@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ada@example.com');
});

test('PUT /users/:id lets a user change only the case of their own email', async () => {
  const res = await request(app).put('/users/1').send({ email: 'ADA@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ADA@example.com');
});

// --- Requirement 2: user id validation ---

test('GET /users/:id accepts a zero-padded id ("007" is 7)', async () => {
  for (let i = 0; i < 5; i += 1) {
    store.createUser({ name: `User ${i}`, email: `user${i}@example.com` });
  }
  const res = await request(app).get('/users/007');
  assert.equal(res.status, 200);
  assert.equal(res.body.id, 7);
});

const INVALID_IDS = ['abc', '1.5', '1e0', ' 1', '0x1', '0', '-1'];

for (const badId of INVALID_IDS) {
  test(`GET /users/:id returns 400 for invalid id ${JSON.stringify(badId)}`, async () => {
    const res = await request(app).get(`/users/${encodeURIComponent(badId)}`);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'invalid user id' });
  });

  test(`PUT /users/:id returns 400 for invalid id ${JSON.stringify(badId)}`, async () => {
    const res = await request(app)
      .put(`/users/${encodeURIComponent(badId)}`)
      .send({ name: 'Valid Name' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'invalid user id' });
  });
}

// --- Requirement 3: malformed JSON ---

test('POST /users returns 400 with exact body for malformed JSON', async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{"name": ');
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'Malformed JSON' });
});

test('PUT /users/:id returns 400 with exact body for malformed JSON', async () => {
  const res = await request(app)
    .put('/users/1')
    .set('Content-Type', 'application/json')
    .send('{"name": ');
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'Malformed JSON' });
});

// --- Requirement 4: PUT check order ---

test('PUT /users/:id returns 404 (not 400) for a missing user with an invalid body', async () => {
  const res = await request(app).put('/users/999').send({ name: '' });
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

// --- Requirement 5: name and email validation ---

test('POST /users rejects a 101-character name', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'a'.repeat(101), email: 'long@example.com' });
  assert.equal(res.status, 400);
});

test('POST /users accepts a 100-character name', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'a'.repeat(100), email: 'max@example.com' });
  assert.equal(res.status, 201);
});

test('POST /users rejects a 255-character email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Too Long', email: `${'a'.repeat(243)}@example.com` });
  assert.equal(res.status, 400);
});

test('POST /users accepts a 254-character email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Max Length', email: `${'a'.repeat(242)}@example.com` });
  assert.equal(res.status, 201);
});

test('POST /users rejects a non-string name and an invalid email format', async () => {
  const numericName = await request(app)
    .post('/users')
    .send({ name: 42, email: 'num@example.com' });
  assert.equal(numericName.status, 400);

  const badEmail = await request(app)
    .post('/users')
    .send({ name: 'Bad Email', email: 'not-an-email' });
  assert.equal(badEmail.status, 400);
});

test('POST /users stores trimmed name and email', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '  Grace Hopper  ', email: '  grace@example.com  ' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.equal(res.body.email, 'grace@example.com');
});

test('PUT /users/:id stores trimmed name and email', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: '  Ada L.  ', email: '  new@example.com  ' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'new@example.com');
});

test('PUT /users/:id leaves an omitted field unchanged', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada Only' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ada@example.com');
});

test('PUT /users/:id returns 400 when neither name nor email is provided', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
});

test('PUT /users/:id returns 400 for null, empty, whitespace-only, or non-string fields', async () => {
  const badBodies = [
    { name: null },
    { name: '' },
    { name: '   ' },
    { name: 42 },
    { email: null },
    { email: '' },
    { email: 'not-an-email' },
  ];
  for (const body of badBodies) {
    const res = await request(app).put('/users/1').send(body);
    assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
  }
});
