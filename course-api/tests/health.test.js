const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /health returns 200', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
});

test('GET /health reports status ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.body.status, 'ok');
});

test('GET /health includes a numeric uptime', async () => {
  const res = await request(app).get('/health');
  assert.equal(typeof res.body.uptime, 'number');
  assert.ok(res.body.uptime >= 0);
});
