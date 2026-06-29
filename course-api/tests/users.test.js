const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

async function getToken() {
  const res = await request(app).post('/tokens').send({ email: 'ada@example.com' });
  return res.body.token;
}

test('GET /users without token returns 401', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Unauthorized');
});

test('GET /users with invalid token returns 401', async () => {
  const res = await request(app).get('/users').set('Authorization', 'Bearer bogus');
  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Unauthorized');
});

test('GET /users returns the seeded list', async () => {
  const token = await getToken();
  const res = await request(app).get('/users').set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /users/:id returns 404 for a missing user', async () => {
  const token = await getToken();
  const res = await request(app).get('/users/999').set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 404);
});

test('POST /users creates a user', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/users')
    .set('Authorization', 'Bearer ' + token)
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.ok(res.body.id);
});

test('PUT /users/:id updates an existing user', async () => {
  const token = await getToken();
  const res = await request(app)
    .put('/users/1')
    .set('Authorization', 'Bearer ' + token)
    .send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const token = await getToken();
  const res = await request(app)
    .put('/users/999')
    .set('Authorization', 'Bearer ' + token)
    .send({ name: 'Nobody' });
  assert.equal(res.status, 404);
});

test('DELETE /users/:id removes the user and returns 204', async () => {
  const token = await getToken();
  const res = await request(app).delete('/users/1').set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 204);
  assert.equal(res.text, '');
  const check = await request(app).get('/users/1').set('Authorization', 'Bearer ' + token);
  assert.equal(check.status, 404);
});

test('DELETE /users/:id returns 404 for a missing user', async () => {
  const token = await getToken();
  const res = await request(app).delete('/users/999').set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'User not found');
});
