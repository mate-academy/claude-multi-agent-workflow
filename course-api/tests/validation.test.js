const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 400);
});

test('GET /users/:id returns 400 for another non-numeric id', async () => {
  const res = await request(app).get('/users/not-a-number');
  assert.equal(res.status, 400);
});

test('PUT /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'Nobody' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id returns 400 for another non-numeric id', async () => {
  const res = await request(app)
    .put('/users/not-a-number')
    .send({ name: 'Nobody' });
  assert.equal(res.status, 400);
});
