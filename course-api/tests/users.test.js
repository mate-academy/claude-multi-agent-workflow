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
  assert.equal(typeof res.body.error, 'string');
});

test('GET /users/:id returns the matching user on the success path', async () => {
  const res = await request(app).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
});

test(
  'GET /users/:id returns 400 for a non-numeric id',
  { todo: 'bug: Number("abc") is NaN, matches no user, so this currently returns 404 instead of 400 (routes/users.js:13)' },
  async () => {
    const res = await request(app).get('/users/abc');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'GET /users/:id does not match a non-canonical numeric id like 0x1',
  { todo: 'bug: Number("0x1") === 1, so this currently returns Ada (200) instead of rejecting the id (routes/users.js:13)' },
  async () => {
    const res = await request(app).get('/users/0x1');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.equal(res.body.email, 'grace@example.com');
  assert.ok(res.body.id);
});

test('POST /users persists the new user so a later GET returns it', async () => {
  const created = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(created.status, 201);

  const list = await request(app).get('/users');
  assert.equal(list.body.length, 3);

  const fetched = await request(app).get(`/users/${created.body.id}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.name, 'Grace Hopper');
  assert.equal(fetched.body.email, 'grace@example.com');
});

test('POST /users returns 400 when name is missing', async () => {
  const res = await request(app).post('/users').send({ email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'Grace Hopper' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test(
  'POST /users returns 400 when name is not a string',
  { todo: 'bug: {name: 123} is truthy, so this currently returns 201 with the number stored as-is (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 123, email: 'grace@example.com' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users returns 400 when name is blank',
  { todo: 'bug: "  " is truthy, so this currently returns 201 with a blank name stored (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: '  ', email: 'grace@example.com' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users with a malformed JSON body returns 400 with a JSON error shape',
  { todo: "bug: express.json() throws on malformed bodies and there's no error-handling middleware, so Express's default HTML error page is returned instead of { error } JSON (server.js:6)" },
  async () => {
    const res = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{"name":');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users returns 400 when email is not a string',
  { todo: 'bug: 42 is truthy, so this currently returns 201 with the number stored as-is (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Grace Hopper', email: 42 });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users returns 400 when email is blank',
  { todo: 'bug: "  " is truthy, so this currently returns 201 with a blank email stored (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Grace Hopper', email: '  ' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('POST /users ignores a client-supplied id and assigns its own', async () => {
  const res = await request(app)
    .post('/users')
    .send({ id: 1, name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.notEqual(res.body.id, 1);

  const ada = await request(app).get('/users/1');
  assert.equal(ada.status, 200);
  assert.equal(ada.body.name, 'Ada Lovelace');
});

test(
  'GET /users/:id returns 400 for a negative id',
  { todo: 'bug: no parseId validation exists yet; Number("-1") matches no user, so this currently returns 404 instead of 400 (routes/users.js:13)' },
  async () => {
    const res = await request(app).get('/users/-1');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'GET /users/:id returns 400 for id zero',
  { todo: 'bug: no parseId validation exists yet; Number("0") matches no user, so this currently returns 404 instead of 400 (routes/users.js:13)' },
  async () => {
    const res = await request(app).get('/users/0');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');

  const fetched = await request(app).get('/users/1');
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.name, 'Ada L.');
  assert.equal(fetched.body.email, 'ada@example.com');
});

test('PUT /users/:id updates only the email and leaves the name unchanged', async () => {
  const res = await request(app).put('/users/1').send({ email: 'ada.new@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'ada.new@example.com');
  assert.equal(res.body.name, 'Ada Lovelace');

  const fetched = await request(app).get('/users/1');
  assert.equal(fetched.body.email, 'ada.new@example.com');
  assert.equal(fetched.body.name, 'Ada Lovelace');
});

test('PUT /users/:id returns 400 for an empty body', async () => {
  const res = await request(app).put('/users/1').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test(
  'PUT /users/:id returns 400 when name is null',
  { todo: 'bug: only undefined is rejected, so {name: null} is stored as-is and returns 200 (routes/users.js:33, db/store.js:34)' },
  async () => {
    const res = await request(app).put('/users/1').send({ name: null });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id returns 400 when name is blank',
  { todo: 'bug: only undefined is rejected, so {name: ""} is stored as-is and returns 200 (routes/users.js:33)' },
  async () => {
    const res = await request(app).put('/users/1').send({ name: '' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id returns 400 when email is not a string',
  { todo: 'bug: only undefined is rejected, so {email: 42} is stored as-is and returns 200 (routes/users.js:33)' },
  async () => {
    const res = await request(app).put('/users/1').send({ email: 42 });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id returns 400 for a non-numeric id',
  { todo: 'bug: Number("abc") is NaN, matches no user, so this currently returns 404 instead of 400 (routes/users.js:36)' },
  async () => {
    const res = await request(app).put('/users/abc').send({ name: 'Nobody' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /users/:id updates both name and email at once', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 'Ada L.', email: 'ada.new@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
  assert.equal(res.body.email, 'ada.new@example.com');

  const fetched = await request(app).get('/users/1');
  assert.equal(fetched.body.name, 'Ada L.');
  assert.equal(fetched.body.email, 'ada.new@example.com');
});

test(
  'PUT /users/:id returns 400 when email is null',
  { todo: 'bug: only undefined is rejected, so {email: null} is stored as-is and returns 200 (routes/users.js:33, db/store.js:35)' },
  async () => {
    const res = await request(app).put('/users/1').send({ email: null });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id returns 400 when email is blank',
  { todo: 'bug: only undefined is rejected, so {email: "  "} is stored as-is and returns 200 (routes/users.js:33)' },
  async () => {
    const res = await request(app).put('/users/1').send({ email: '  ' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id does not match a non-canonical numeric id like 0x1',
  { todo: 'bug: Number("0x1") === 1, so this currently updates Ada (200) instead of rejecting the id (routes/users.js:36)' },
  async () => {
    const res = await request(app).put('/users/0x1').send({ name: 'Nobody' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id does not match a non-canonical numeric id like 1.0',
  { todo: 'bug: Number("1.0") === 1, so this currently updates Ada (200) instead of rejecting the id (routes/users.js:36)' },
  async () => {
    const res = await request(app).put('/users/1.0').send({ name: 'Nobody' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('PUT /users/:id with an empty body and a missing user returns 400 for the body, not 404 for the id', async () => {
  const res = await request(app).put('/users/999').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test(
  'GET /users/:id does not match a non-canonical numeric id like 1.0',
  { todo: 'bug: Number("1.0") === 1, so this currently returns Ada (200) instead of rejecting the id (routes/users.js:13)' },
  async () => {
    const res = await request(app).get('/users/1.0');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id returns 400 for id zero',
  { todo: 'bug: no parseId validation exists yet; Number("0") matches no user, so this currently returns 404 instead of 400 (routes/users.js:36)' },
  async () => {
    const res = await request(app).put('/users/0').send({ name: 'Nobody' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id returns 400 for a negative id',
  { todo: 'bug: no parseId validation exists yet; Number("-1") matches no user, so this currently returns 404 instead of 400 (routes/users.js:36)' },
  async () => {
    const res = await request(app).put('/users/-1').send({ name: 'Nobody' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id returns 400 when name is not a string',
  { todo: 'bug: only undefined is rejected, so {name: 123} is stored as-is and returns 200 (routes/users.js:33)' },
  async () => {
    const res = await request(app).put('/users/1').send({ name: 123 });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id returns 400 when name is whitespace-only',
  { todo: 'bug: only undefined is rejected, so {name: "  "} is stored as-is and returns 200 (routes/users.js:33)' },
  async () => {
    const res = await request(app).put('/users/1').send({ name: '  ' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('PUT /users/:id returns 400 when the body has only unknown fields', async () => {
  const res = await request(app).put('/users/1').send({ foo: 1 });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('PUT /users/:id ignores a client-supplied id and updates the id from the URL', async () => {
  const res = await request(app).put('/users/1').send({ id: 99, name: 'x' });
  assert.equal(res.status, 200);
  assert.equal(res.body.id, 1);
  assert.equal(res.body.name, 'x');

  const fetched = await request(app).get('/users/1');
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.name, 'x');
});

test(
  'PUT /users/:id with a malformed JSON body returns 400 with a JSON error shape',
  { todo: "bug: express.json() throws on malformed bodies and there's no error-handling middleware, so Express's default HTML error page is returned instead of { error } JSON (server.js:6)" },
  async () => {
    const res = await request(app)
      .put('/users/1')
      .set('Content-Type', 'application/json')
      .send('{"name":');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('POST /users returns 400 when name is null', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: null, email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 when email is null', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: null });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('GET /users returns the seeded users with the correct shape and content', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ]);
});

test(
  'GET /users/:id does not match a leading-zero id like 01',
  { todo: "bug: Number('01') === 1, so this currently returns Ada (200) instead of rejecting the id (routes/users.js:13)" },
  async () => {
    const res = await request(app).get('/users/01');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'GET /users/:id does not match an exponent-form id like 1e0',
  { todo: "bug: Number('1e0') === 1, so this currently returns Ada (200) instead of rejecting the id (routes/users.js:13)" },
  async () => {
    const res = await request(app).get('/users/1e0');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'GET /users/:id does not match a padded id like " 1"',
  { todo: "bug: Number(' 1') === 1, so this currently returns Ada (200) instead of rejecting the id (routes/users.js:13)" },
  async () => {
    const res = await request(app).get('/users/%201');
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id does not match a leading-zero id like 01',
  { todo: "bug: Number('01') === 1, so this currently updates Ada (200) instead of rejecting the id (routes/users.js:36)" },
  async () => {
    const res = await request(app).put('/users/01').send({ name: 'Nobody' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id does not match an exponent-form id like 1e0',
  { todo: "bug: Number('1e0') === 1, so this currently updates Ada (200) instead of rejecting the id (routes/users.js:36)" },
  async () => {
    const res = await request(app).put('/users/1e0').send({ name: 'Nobody' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id does not match a padded id like " 1"',
  { todo: "bug: Number(' 1') === 1, so this currently updates Ada (200) instead of rejecting the id (routes/users.js:36)" },
  async () => {
    const res = await request(app).put('/users/%201').send({ name: 'Nobody' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('POST /users returns 400 when name is an empty string', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '', email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users returns 400 when email is an empty string', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: '' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test(
  'POST /users returns 400 when name is an object',
  { todo: 'bug: {} is truthy, so this currently returns 201 with the object stored as-is (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: { first: 'Grace' }, email: 'grace@example.com' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users returns 400 when name is an array',
  { todo: 'bug: a non-empty array is truthy, so this currently returns 201 with the array stored as-is (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: ['Grace', 'Hopper'], email: 'grace@example.com' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users returns 400 when name is a boolean',
  { todo: 'bug: true is truthy, so this currently returns 201 with the boolean stored as-is (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: true, email: 'grace@example.com' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users returns 400 when email is an object',
  { todo: 'bug: {} is truthy, so this currently returns 201 with the object stored as-is (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Grace Hopper', email: { address: 'grace@example.com' } });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users returns 400 when email is an array',
  { todo: 'bug: a non-empty array is truthy, so this currently returns 201 with the array stored as-is (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Grace Hopper', email: ['grace@example.com'] });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'POST /users returns 400 when email is a boolean',
  { todo: 'bug: true is truthy, so this currently returns 201 with the boolean stored as-is (routes/users.js:23)' },
  async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Grace Hopper', email: true });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('POST /users assigns different, increasing ids to successive creates', async () => {
  const first = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  const second = await request(app)
    .post('/users')
    .send({ name: 'Margaret Hamilton', email: 'margaret@example.com' });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual(first.body.id, second.body.id);
  assert.ok(second.body.id > first.body.id);
});

test(
  'PUT /users/:id rejects a body with one valid field and one invalid field',
  { todo: 'bug: fields are validated independently, so a valid name alongside an invalid email is accepted and email is stored as null (routes/users.js:33)' },
  async () => {
    const res = await request(app).put('/users/1').send({ name: 'Ada L.', email: null });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.error, 'string');
  }
);

test(
  'PUT /users/:id leaves the stored record unchanged when the update is rejected',
  { todo: 'bug: {name: null} is currently accepted and stored (routes/users.js:33, db/store.js:34), so the record is not actually left unchanged' },
  async () => {
    const res = await request(app).put('/users/1').send({ name: null });
    assert.equal(res.status, 400);

    const fetched = await request(app).get('/users/1');
    assert.deepEqual(fetched.body, { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
  }
);

test('PUT /users/:id with a malformed id and an empty body returns 400', async () => {
  const res = await request(app).put('/users/abc').send({});
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test(
  'GET /nope returns a JSON 404 instead of the default HTML page',
  { todo: 'bug: no catch-all 404 handler exists, so unknown routes fall through to Express\'s default HTML error page (server.js:6)' },
  async () => {
    const res = await request(app).get('/nope');
    assert.equal(res.status, 404);
    assert.equal(typeof res.body.error, 'string');
  }
);

test('POST /users with a rejected create does not add a user or consume an id', async () => {
  const rejected = await request(app).post('/users').send({ email: 'nobody@example.com' });
  assert.equal(rejected.status, 400);

  const list = await request(app).get('/users');
  assert.equal(list.body.length, 2);

  const created = await request(app)
    .post('/users')
    .send({ name: 'New User', email: 'new@example.com' });
  assert.equal(created.status, 201);
  assert.equal(created.body.id, 3);
});

test('PUT /users/999 does not create a record when the user does not exist', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);

  const list = await request(app).get('/users');
  assert.equal(list.body.length, 2);

  const fetched = await request(app).get('/users/999');
  assert.equal(fetched.status, 404);
});

test('POST /users with a form-urlencoded body returns 400 with a JSON error shape', async () => {
  const res = await request(app)
    .post('/users')
    .type('form')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users with no body at all returns 400 with a JSON error shape', async () => {
  const res = await request(app).post('/users');
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.error, 'string');
});

test('POST /users stores name and email exactly as sent, without trimming padding', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '  Grace  ', email: '  grace@example.com  ' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, '  Grace  ');
  assert.equal(res.body.email, '  grace@example.com  ');

  const fetched = await request(app).get(`/users/${res.body.id}`);
  assert.equal(fetched.body.name, '  Grace  ');
  assert.equal(fetched.body.email, '  grace@example.com  ');
});

test(
  'DELETE /users/1 returns a JSON 404 instead of the default HTML page',
  { todo: 'bug: no DELETE route and no catch-all 404 handler exists, so this falls through to Express\'s default HTML error page (server.js:6)' },
  async () => {
    const res = await request(app).delete('/users/1');
    assert.equal(res.status, 404);
    assert.equal(typeof res.body.error, 'string');
  }
);
