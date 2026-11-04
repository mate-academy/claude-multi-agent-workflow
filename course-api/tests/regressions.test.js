const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

const ADA = { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' };

async function assertUser1Unchanged() {
  const res = await request(app).get('/users/1');
  assert.deepEqual(res.body, ADA);
}

function assertJsonError(res, status) {
  assert.equal(res.status, status);
  assert.match(res.headers['content-type'], /application\/json/);
  assert.ok(res.body.error);
}

// 1. PUT validation
for (const [label, body] of [
  ['name null', { name: null }],
  ['email empty string', { email: '' }],
  ['email number', { email: 42 }],
]) {
  test(`PUT /users/1 with ${label} returns 400 and leaves user unchanged`, async () => {
    const res = await request(app).put('/users/1').send(body);
    assertJsonError(res, 400);
    await assertUser1Unchanged();
  });
}

// 2. POST validation
test('POST /users with object name and array email returns 400', async () => {
  const res = await request(app).post('/users').send({ name: { a: 1 }, email: ['x'] });
  assertJsonError(res, 400);
  assert.equal(store.listUsers().length, 2);
});

test('POST /users with malformed email returns 400', async () => {
  const res = await request(app).post('/users').send({ name: 'X', email: 'not-an-email' });
  assertJsonError(res, 400);
});

test('POST /users with no body and no content-type returns JSON 400', async () => {
  const res = await request(app).post('/users');
  assertJsonError(res, 400);
});

test('POST /users with text/plain body returns JSON 400', async () => {
  const res = await request(app).post('/users').set('Content-Type', 'text/plain').send('hello');
  assertJsonError(res, 400);
});

// 3. PUT with no/non-JSON body
test('PUT /users/1 with no body returns JSON 400', async () => {
  const res = await request(app).put('/users/1');
  assertJsonError(res, 400);
});

test('PUT /users/1 with text/plain body returns JSON 400', async () => {
  const res = await request(app).put('/users/1').set('Content-Type', 'text/plain').send('hello');
  assertJsonError(res, 400);
});

// 4. Non-numeric ids
test('GET /users/abc returns 400 Invalid id', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid id');
});

test('PUT /users/abc returns 400 Invalid id', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'x' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid id');
});

for (const id of ['1.0', '0x1', '1e0', '%201']) {
  test(`GET /users/${id} returns 400 Invalid id`, async () => {
    const res = await request(app).get(`/users/${id}`);
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid id');
  });
  test(`PUT /users/${id} returns 400 and does not modify user 1`, async () => {
    const res = await request(app).put(`/users/${id}`).send({ name: 'Hacked' });
    assert.equal(res.status, 400);
    await assertUser1Unchanged();
  });
}

// 5. JSON error responses
test('POST /users with malformed JSON returns JSON 400', async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{bad json');
  assertJsonError(res, 400);
});

test('GET /nope returns JSON 404', async () => {
  const res = await request(app).get('/nope');
  assertJsonError(res, 404);
});

// 6. Duplicate emails (assumption: docs do not say emails must be unique)
test('duplicate email (assumes emails are unique): POST same email twice is rejected', async () => {
  const res = await request(app).post('/users').send({ name: 'Dup', email: 'ada@example.com' });
  assert.ok([400, 409].includes(res.status), `got ${res.status}`);
  assert.equal(store.listUsers().length, 2);
});

test('duplicate email (assumes emails are unique): PUT user 2 to user 1 email is rejected', async () => {
  const res = await request(app).put('/users/2').send({ email: 'ada@example.com' });
  assert.ok([400, 409].includes(res.status), `got ${res.status}`);
  const u2 = await request(app).get('/users/2');
  assert.equal(u2.body.email, 'alan@example.com');
});
