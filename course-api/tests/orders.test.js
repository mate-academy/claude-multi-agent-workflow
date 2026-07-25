const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /orders returns the seeded list', async () => {
  const res = await request(app).get('/orders');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /orders/:id returns the matching order', async () => {
  const res = await request(app).get('/orders/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    userId: 1,
    item: 'Analytical Engine plans',
    quantity: 1,
  });
});

test('GET /orders/:id returns 404 for a missing order', async () => {
  const res = await request(app).get('/orders/999');
  assert.equal(res.status, 404);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /orders creates an order', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ userId: 1, item: 'Difference Engine parts', quantity: 3 });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, {
    id: 3,
    userId: 1,
    item: 'Difference Engine parts',
    quantity: 3,
  });
});

test('POST /orders persists the new order and increments the id from the seeded nextOrderId', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ userId: 1, item: 'Difference Engine parts', quantity: 3 });
  assert.equal(res.status, 201);
  assert.equal(res.body.id, 3);

  const listRes = await request(app).get('/orders');
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.length, 3);
  assert.deepEqual(listRes.body[2], {
    id: 3,
    userId: 1,
    item: 'Difference Engine parts',
    quantity: 3,
  });
});

test('POST /orders defaults quantity to 1 when omitted', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ userId: 2, item: 'Bombe blueprints' });
  assert.equal(res.status, 201);
  assert.equal(res.body.quantity, 1);
});

test('POST /orders returns 400 when userId is missing', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ item: 'Bombe blueprints' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /orders returns 400 when item is missing', async () => {
  const res = await request(app).post('/orders').send({ userId: 1 });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /orders returns 400 when userId does not match an existing user', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ userId: 999, item: 'Bombe blueprints' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /orders returns 400 when quantity is zero', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ userId: 1, item: 'Bombe blueprints', quantity: 0 });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /orders returns 400 when quantity is not an integer', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ userId: 1, item: 'Bombe blueprints', quantity: 1.5 });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /orders returns 400 when quantity is not a number', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ userId: 1, item: 'Bombe blueprints', quantity: 'many' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /orders/:id updates a single field', async () => {
  const res = await request(app).put('/orders/1').send({ quantity: 5 });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    userId: 1,
    item: 'Analytical Engine plans',
    quantity: 5,
  });
});

test('PUT /orders/:id updates multiple fields at once', async () => {
  const res = await request(app)
    .put('/orders/1')
    .send({ userId: 2, item: 'Updated item', quantity: 7 });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    id: 1,
    userId: 2,
    item: 'Updated item',
    quantity: 7,
  });
});

test('PUT /orders/:id returns 400 for an empty body', async () => {
  const res = await request(app).put('/orders/1').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /orders/:id returns 400 when userId does not match an existing user', async () => {
  const res = await request(app).put('/orders/1').send({ userId: 999 });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /orders/:id returns 400 when quantity is not a positive integer', async () => {
  const res = await request(app).put('/orders/1').send({ quantity: -1 });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /orders/:id returns 404 for a missing order', async () => {
  const res = await request(app).put('/orders/999').send({ quantity: 2 });
  assert.equal(res.status, 404);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /orders/:id returns 404 for a missing order even when the body is otherwise invalid', async () => {
  const res = await request(app).put('/orders/999').send({ userId: 999 });
  assert.equal(res.status, 404);
  assert.equal(typeof res.body.error, 'string');
});
