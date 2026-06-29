const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('POST /tokens with valid email returns 201 and a token string', async () => {
  const res = await request(app).post('/tokens').send({ email: 'ada@example.com' });
  assert.equal(res.status, 201);
  assert.equal(typeof res.body.token, 'string');
  assert.ok(res.body.token.length > 0);
});

test('POST /tokens without email returns 400', async () => {
  const res = await request(app).post('/tokens').send({});
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'email is required');
});

test('POST /tokens with unknown email returns 401', async () => {
  const res = await request(app).post('/tokens').send({ email: 'nobody@example.com' });
  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Invalid credentials');
});

test('DELETE /tokens/:token returns 204 for a live token', async () => {
  const postRes = await request(app).post('/tokens').send({ email: 'ada@example.com' });
  const { token } = postRes.body;
  const delRes = await request(app).delete(`/tokens/${token}`);
  assert.equal(delRes.status, 204);
  assert.equal(delRes.text, '');
});

test('DELETE /tokens/:token returns 404 for unknown token', async () => {
  const res = await request(app).delete('/tokens/doesnotexist');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Token not found');
});
