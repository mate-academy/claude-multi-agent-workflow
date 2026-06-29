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

test('GET /users/1/bank-accounts without Authorization header returns 401', async () => {
  const res = await request(app).get('/users/1/bank-accounts');
  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Unauthorized');
});

test('GET /users/1/bank-accounts with invalid token returns 401', async () => {
  const res = await request(app)
    .get('/users/1/bank-accounts')
    .set('Authorization', 'Bearer bogus');
  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Unauthorized');
});

test('GET /users/999/bank-accounts with valid token returns 404 User not found', async () => {
  const token = await getToken();
  const res = await request(app)
    .get('/users/999/bank-accounts')
    .set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'User not found');
});

test('GET /users/1/bank-accounts with valid token and no accounts returns 200 []', async () => {
  const token = await getToken();
  const res = await request(app)
    .get('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 0);
});

test('POST /users/999/bank-accounts with valid token returns 404 User not found', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/users/999/bank-accounts')
    .set('Authorization', 'Bearer ' + token)
    .send({ accountNumber: '12345', bankName: 'First Bank' });
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'User not found');
});

test('POST /users/1/bank-accounts with missing accountNumber returns 400', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token)
    .send({ bankName: 'First Bank' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'accountNumber and bankName are required');
});

test('POST /users/1/bank-accounts with missing bankName returns 400', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token)
    .send({ accountNumber: '12345' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'accountNumber and bankName are required');
});

test('POST /users/1/bank-accounts creates a bank account and returns 201', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token)
    .send({ accountNumber: '12345', bankName: 'First Bank' });
  assert.equal(res.status, 201);
  assert.ok(res.body.id);
  assert.equal(res.body.userId, 1);
  assert.equal(res.body.accountNumber, '12345');
  assert.equal(res.body.bankName, 'First Bank');
});

test('GET /users/1/bank-accounts after creating one returns array with length 1', async () => {
  const token = await getToken();
  await request(app)
    .post('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token)
    .send({ accountNumber: '12345', bankName: 'First Bank' });
  const res = await request(app)
    .get('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 1);
});

test('GET /users/1/bank-accounts/:id returns the created account', async () => {
  const token = await getToken();
  const created = await request(app)
    .post('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token)
    .send({ accountNumber: '12345', bankName: 'First Bank' });
  const id = created.body.id;
  const res = await request(app)
    .get(`/users/1/bank-accounts/${id}`)
    .set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 200);
  assert.equal(res.body.id, id);
  assert.equal(res.body.userId, 1);
  assert.equal(res.body.accountNumber, '12345');
  assert.equal(res.body.bankName, 'First Bank');
});

test('GET /users/1/bank-accounts/999 returns 404 Bank account not found', async () => {
  const token = await getToken();
  const res = await request(app)
    .get('/users/1/bank-accounts/999')
    .set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Bank account not found');
});

test('GET /users/2/bank-accounts/:id where id belongs to user 1 returns 404 (cross-user isolation)', async () => {
  const token = await getToken();
  const created = await request(app)
    .post('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token)
    .send({ accountNumber: '12345', bankName: 'First Bank' });
  const id = created.body.id;
  const res = await request(app)
    .get(`/users/2/bank-accounts/${id}`)
    .set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 404);
});

test('DELETE /users/1/bank-accounts/:id removes the account and subsequent GET returns 404', async () => {
  const token = await getToken();
  const created = await request(app)
    .post('/users/1/bank-accounts')
    .set('Authorization', 'Bearer ' + token)
    .send({ accountNumber: '12345', bankName: 'First Bank' });
  const id = created.body.id;
  const del = await request(app)
    .delete(`/users/1/bank-accounts/${id}`)
    .set('Authorization', 'Bearer ' + token);
  assert.equal(del.status, 204);
  assert.equal(del.text, '');
  const check = await request(app)
    .get(`/users/1/bank-accounts/${id}`)
    .set('Authorization', 'Bearer ' + token);
  assert.equal(check.status, 404);
});

test('DELETE /users/1/bank-accounts/999 returns 404 Bank account not found', async () => {
  const token = await getToken();
  const res = await request(app)
    .delete('/users/1/bank-accounts/999')
    .set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Bank account not found');
});
