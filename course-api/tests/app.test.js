const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

test('unknown route returns a JSON 404 with an error message', { todo: true }, async () => {
  const res = await request(app).get('/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.type, 'application/json');
  assert.equal(typeof res.body.error, 'string');
});
