const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /users/:id returns the matching user', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
});

test('POST /users returns 400 when name is missing', async () => {
  const res = await request(app).post('/users').send({ email: 'x@example.com' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'X' });
  assert.equal(res.status, 400);
});

test('POST /users persists the user and assigns incrementing ids', async () => {
  const a = await request(app).post('/users').send({ name: 'A', email: 'a@example.com' });
  const b = await request(app).post('/users').send({ name: 'B', email: 'b@example.com' });
  assert.equal(a.body.id, 3);
  assert.equal(b.body.id, 4);
  const got = await request(app).get('/users/3');
  assert.equal(got.body.email, 'a@example.com');
  const list = await request(app).get('/users');
  assert.equal(list.body.length, 4);
});

test('PUT /users/:id returns 400 when no fields are provided', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('PUT /users/:id updates email only and keeps name', async () => {
  const res = await request(app).put('/users/1').send({ email: 'new@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'new@example.com');
  assert.equal(res.body.name, 'Ada Lovelace');
});

test('PUT /users/:id change is visible via GET', async () => {
  await request(app).put('/users/2').send({ name: 'Alan T.' });
  const res = await request(app).get('/users/2');
  assert.equal(res.body.name, 'Alan T.');
});
