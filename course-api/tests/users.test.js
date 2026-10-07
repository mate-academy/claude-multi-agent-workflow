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

test('GET /health returns ok status', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(typeof res.body.uptime === 'number');
  assert.ok(res.body.uptime > 0);
});

test('GET /users returns users with all required fields', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  for (const user of res.body) {
    assert.ok(user.id);
    assert.ok(user.name);
    assert.ok(user.email);
  }
});

test('GET /users returns correct seeded data', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.equal(res.body[0].id, 1);
  assert.equal(res.body[0].name, 'Ada Lovelace');
  assert.equal(res.body[0].email, 'ada@example.com');
  assert.equal(res.body[1].id, 2);
  assert.equal(res.body[1].name, 'Alan Turing');
  assert.equal(res.body[1].email, 'alan@example.com');
});

test('GET /users returns all created users', async () => {
  await request(app).post('/users').send({ name: 'Grace Hopper', email: 'grace@example.com' });
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 3);
  assert.ok(res.body.some((u) => u.name === 'Grace Hopper'));
});

test('GET /users/:id returns a single user', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.equal(res.body.id, 1);
  assert.equal(res.body.name, 'Ada Lovelace');
  assert.equal(res.body.email, 'ada@example.com');
});

test('GET /users/:id returns the correct user when multiple exist', async () => {
  const res = await request(app).get('/users/2');
  assert.equal(res.status, 200);
  assert.equal(res.body.id, 2);
  assert.equal(res.body.name, 'Alan Turing');
  assert.equal(res.body.email, 'alan@example.com');
});

test('POST /users assigns incrementing IDs', async () => {
  const res1 = await request(app).post('/users').send({ name: 'User 1', email: 'user1@example.com' });
  const res2 = await request(app).post('/users').send({ name: 'User 2', email: 'user2@example.com' });
  assert.ok(res1.body.id < res2.body.id);
});

test('POST /users creates a user with unique ID', async () => {
  const res1 = await request(app).post('/users').send({ name: 'User 1', email: 'user1@example.com' });
  const res2 = await request(app).post('/users').send({ name: 'User 2', email: 'user2@example.com' });
  assert.notEqual(res1.body.id, res2.body.id);
});

test('POST /users without name returns 400', async () => {
  const res = await request(app).post('/users').send({ email: 'noname@example.com' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users without email returns 400', async () => {
  const res = await request(app).post('/users').send({ name: 'No Email' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users without name and email returns 400', async () => {
  const res = await request(app).post('/users').send({});
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('POST /users with empty name returns 400', async () => {
  const res = await request(app).post('/users').send({ name: '', email: 'test@example.com' });
  assert.equal(res.status, 400);
});

test('POST /users with empty email returns 400', async () => {
  const res = await request(app).post('/users').send({ name: 'Test', email: '' });
  assert.equal(res.status, 400);
});

test('POST /users persists the user', async () => {
  const createRes = await request(app).post('/users').send({ name: 'Grace Hopper', email: 'grace@example.com' });
  const userId = createRes.body.id;
  const getRes = await request(app).get('/users/' + userId);
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.name, 'Grace Hopper');
  assert.equal(getRes.body.email, 'grace@example.com');
});

test('PUT /users/:id updates only the name', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'ada@example.com');
});

test('PUT /users/:id updates only the email', async () => {
  const res = await request(app).put('/users/1').send({ email: 'ada.lovelace@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada Lovelace');
  assert.equal(res.body.email, 'ada.lovelace@example.com');
});

test('PUT /users/:id updates both name and email', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.', email: 'ada.l@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'ada.l@example.com');
});

test('PUT /users/:id with neither name nor email returns 400', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name or email is required' });
});

test('PUT /users/:id with empty name returns 400', async () => {
  const res = await request(app).put('/users/1').send({ name: '' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id with empty email returns 400', async () => {
  const res = await request(app).put('/users/1').send({ email: '' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id persists the update', async () => {
  await request(app).put('/users/1').send({ name: 'Ada L.' });
  const getRes = await request(app).get('/users/1');
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.name, 'Ada L.');
  assert.equal(getRes.body.email, 'ada@example.com');
});

test('PUT /users/:id maintains user ID', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Updated' });
  assert.equal(res.body.id, 1);
});

// Additional coverage for invalid inputs and edge cases

test('GET /users/:id with non-numeric ID returns 404', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 404);
});

test('GET /users/:id with non-numeric ID has error field', async () => {
  const res = await request(app).get('/users/invalid');
  assert.equal(res.status, 404);
  assert.ok(res.body.error);
});

test('GET /users/:id with negative ID returns 404', async () => {
  const res = await request(app).get('/users/-1');
  assert.equal(res.status, 404);
});

test('PUT /users/:id with non-numeric ID returns 404', async () => {
  const res = await request(app).put('/users/abc').send({ name: 'Test' });
  assert.equal(res.status, 404);
});

test('POST /users with null name returns 400', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: null, email: 'test@example.com' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /users with null email returns 400', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test User', email: null });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /users with both null returns 400', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: null, email: null });
  assert.equal(res.status, 400);
});

test('POST /users accepts extra fields in request body', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test User', email: 'test@example.com', extra: 'field', age: 30 });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Test User');
  assert.equal(res.body.email, 'test@example.com');
});

test('POST /users with duplicate email succeeds', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'New User', email: 'ada@example.com' });
  assert.equal(res.status, 201);
  assert.ok(res.body.id);
});

test('POST /users without body returns 400', async () => {
  const res = await request(app).post('/users');
  assert.equal(res.status, 400);
});

test('GET /users/:id returns proper error object', async () => {
  const res = await request(app).get('/users/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('POST /users error response has correct format', async () => {
  const res = await request(app).post('/users').send({ name: 'Only Name' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});

test('PUT /users/:id error response has correct format', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Test' });
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('PUT /users/:id with null name field returns 400', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: null });
  assert.equal(res.status, 400);
});

test('PUT /users/:id with null email field returns 400', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: null });
  assert.equal(res.status, 400);
});

test('DELETE /users/:id returns 404', async () => {
  const res = await request(app).delete('/users/1');
  assert.equal(res.status, 404);
});

test('PATCH /users/:id returns 404', async () => {
  const res = await request(app).patch('/users/1').send({ name: 'Test' });
  assert.equal(res.status, 404);
});

test('GET /unknown-route returns 404', async () => {
  const res = await request(app).get('/unknown-route');
  assert.equal(res.status, 404);
});

test('POST /unknown-route returns 404', async () => {
  const res = await request(app).post('/unknown-route').send({ test: 'data' });
  assert.equal(res.status, 404);
});

test('POST /users with special characters in name succeeds', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: "Test User's Name@2024", email: 'special@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, "Test User's Name@2024");
});

test('POST /users with special characters in email succeeds', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test User', email: 'test+tag@example.co.uk' });
  assert.equal(res.status, 201);
  assert.equal(res.body.email, 'test+tag@example.co.uk');
});

test('GET /users/:id with float ID returns 404', async () => {
  const res = await request(app).get('/users/1.5');
  assert.equal(res.status, 404);
});

test('POST /users response includes all required fields', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test User', email: 'test@example.com' });
  assert.equal(res.status, 201);
  assert.ok(res.body.id);
  assert.ok(res.body.name);
  assert.ok(res.body.email);
  assert.equal(Object.keys(res.body).length, 3);
});

test('PUT /users/:id with non-numeric ID and valid body returns 404', async () => {
  const res = await request(app).put('/users/xyz').send({ name: 'Test' });
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});

test('POST /users with whitespace-only name returns 400', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '   ', email: 'test@example.com' });
  assert.equal(res.status, 400);
});

test('POST /users with whitespace-only email returns 400', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test', email: '   ' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id with whitespace-only name returns 400', async () => {
  const res = await request(app).put('/users/1').send({ name: '   ' });
  assert.equal(res.status, 400);
});

test('PUT /users/:id with whitespace-only email returns 400', async () => {
  const res = await request(app).put('/users/1').send({ email: '   ' });
  assert.equal(res.status, 400);
});
