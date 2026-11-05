const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

function assertJsonError(res, status) {
  if (Array.isArray(status)) assert.ok(status.includes(res.status), `status ${res.status}`);
  else assert.equal(res.status, status);
  assert.match(res.headers['content-type'] || '', /json/);
  assert.equal(typeof res.body.error, 'string');
}

// Finding 1
test('POST /users with no body returns 400 JSON error', async () => {
  assertJsonError(await request(app).post('/users'), 400);
});
test('POST /users with text/plain body returns 400 JSON error', async () => {
  const res = await request(app).post('/users').set('Content-Type', 'text/plain').send('hello');
  assertJsonError(res, 400);
});
test('PUT /users/1 with no body returns 400 JSON error', async () => {
  assertJsonError(await request(app).put('/users/1'), 400);
});
test('PUT /users/1 with text/plain body returns 400 JSON error', async () => {
  const res = await request(app).put('/users/1').set('Content-Type', 'text/plain').send('hello');
  assertJsonError(res, 400);
});

// Finding 2
for (const [label, body] of [
  ['non-string name', { name: 123, email: 'a@b.com' }],
  ['object name', { name: {}, email: 'a@b.com' }],
  ['non-string email', { name: 'X', email: 42 }],
  ['invalid email format', { name: 'X', email: 'not-an-email' }],
]) {
  test(`POST /users rejects ${label}`, async () => {
    const res = await request(app).post('/users').send(body);
    assertJsonError(res, 400);
    assert.equal(store.listUsers().length, 2);
  });
}
test('POST /users rejects duplicate email', async () => {
  const res = await request(app).post('/users').send({ name: 'Dup', email: 'ada@example.com' });
  assertJsonError(res, [400, 409]);
  assert.equal(store.listUsers().length, 2);
});

// Finding 3
for (const [label, name] of [['null', null], ['empty string', ''], ['number', 123]]) {
  test(`PUT /users/1 rejects name ${label}`, async () => {
    const res = await request(app).put('/users/1').send({ name });
    assertJsonError(res, 400);
    assert.equal(store.getUser(1).name, 'Ada Lovelace');
  });
}
test('PUT /users/1 with empty object returns 400', async () => {
  assertJsonError(await request(app).put('/users/1').send({}), 400);
});
test('PUT /users/999 returns 404 JSON error', async () => {
  assertJsonError(await request(app).put('/users/999').send({ name: 'N' }), 404);
});
test('PUT /users/1 returns 200 and updates email', async () => {
  const res = await request(app).put('/users/1').send({ email: 'new@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'new@example.com');
  assert.equal(res.body.name, 'Ada Lovelace');
});

// Finding 4
for (const id of ['abc', '1.5', '0x1', '-1', '1e0']) {
  test(`GET /users/${id} returns 400`, async () => {
    assertJsonError(await request(app).get(`/users/${id}`), 400);
  });
  test(`PUT /users/${id} returns 400`, async () => {
    assertJsonError(await request(app).put(`/users/${id}`).send({ name: 'X' }), 400);
  });
}

// Finding 5
test('unknown route returns JSON 404', async () => {
  assertJsonError(await request(app).get('/nope'), 404);
});
test('malformed JSON body returns 400 JSON error', async () => {
  const res = await request(app).post('/users').set('Content-Type', 'application/json').send('{"name":');
  assertJsonError(res, 400);
});

// Finding 6
test('listUsers does not leak internal state', () => {
  const list = store.listUsers();
  list.push({ id: 99, name: 'x', email: 'x@y.z' });
  list[0].name = 'HACKED';
  assert.equal(store.listUsers().length, 2);
  assert.equal(store.listUsers()[0].name, 'Ada Lovelace');
});
test('getUser does not leak internal state', () => {
  store.getUser(1).name = 'HACKED';
  assert.equal(store.getUser(1).name, 'Ada Lovelace');
});
test('updateUser return value does not leak internal state', () => {
  const u = store.updateUser(1, { name: 'Ada L.' });
  u.name = 'HACKED';
  assert.equal(store.getUser(1).name, 'Ada L.');
});

// Finding 7
test('createUser with undefined argument does not throw TypeError', () => {
  try {
    store.createUser(undefined);
  } catch (e) {
    assert.ok(!(e instanceof TypeError), 'threw TypeError');
  }
  assert.equal(store.listUsers().length, 2);
});
test('createUser rejects duplicate email', () => {
  let threw = false;
  let result;
  try { result = store.createUser({ name: 'Dup', email: 'ada@example.com' }); } catch (e) { threw = true; }
  assert.ok(threw || !result, 'duplicate should be rejected');
  assert.equal(store.listUsers().length, 2);
});

// Finding 8
test('updateUser with name null does not set name to null', () => {
  try { store.updateUser(1, { name: null }); } catch (e) { /* rejecting is fine */ }
  assert.notEqual(store.getUser(1).name, null);
});
test('updateUser with undefined fields does not throw', () => {
  assert.doesNotThrow(() => store.updateUser(1, { name: undefined, email: undefined }));
  assert.doesNotThrow(() => store.updateUser(1, undefined));
  assert.equal(store.getUser(1).name, 'Ada Lovelace');
});
