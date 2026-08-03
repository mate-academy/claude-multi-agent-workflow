const test = require('node:test');
const assert = require('node:assert');
const store = require('../db/store');

test.beforeEach(() => store.reset());

const SEED = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
];

test('listUsers returns the seed data', () => {
  assert.deepEqual(store.listUsers(), SEED);
});

test('listUsers does not hand out the live internal array', () => {
  const listed = store.listUsers();
  listed.push({ id: 99, name: 'Injected', email: 'injected@example.com' });

  const fresh = store.listUsers();
  assert.equal(fresh.length, 2);
  assert.deepEqual(fresh, SEED);
});

test('listUsers does not hand out live record references', () => {
  const listed = store.listUsers();
  listed[0].name = 'Mutated Via List';

  assert.equal(store.getUser(1).name, 'Ada Lovelace');
});

test('getUser returns the matching record', () => {
  assert.deepEqual(store.getUser(1), SEED[0]);
  assert.deepEqual(store.getUser(2), SEED[1]);
});

test('getUser returns undefined for a missing id', () => {
  assert.equal(store.getUser(999), undefined);
  assert.equal(store.getUser(Number('abc')), undefined);
});

test('getUser does not hand out a live record reference', () => {
  const user = store.getUser(1);
  user.name = 'Mutated Directly';

  assert.equal(store.getUser(1).name, 'Ada Lovelace');
});

test('createUser stores and returns the new user', () => {
  const created = store.createUser({
    name: 'Grace Hopper',
    email: 'grace@example.com',
  });
  assert.deepEqual(created, {
    id: 3,
    name: 'Grace Hopper',
    email: 'grace@example.com',
  });
  assert.equal(store.listUsers().length, 3);
  assert.deepEqual(store.getUser(3), created);
});

test('createUser assigns strictly increasing, non-colliding ids', () => {
  const a = store.createUser({ name: 'A', email: 'a@example.com' });
  const b = store.createUser({ name: 'B', email: 'b@example.com' });
  const c = store.createUser({ name: 'C', email: 'c@example.com' });

  assert.equal(a.id, 3);
  assert.equal(b.id, 4);
  assert.equal(c.id, 5);

  const ids = store.listUsers().map((user) => user.id);
  assert.deepEqual(ids, [1, 2, 3, 4, 5]);
  assert.equal(new Set(ids).size, ids.length);
});

test('createUser does not return a reference that can corrupt the stored record', () => {
  const created = store.createUser({
    name: 'Grace Hopper',
    email: 'grace@example.com',
  });
  created.name = 'Corrupted';
  created.email = 'corrupted@example.com';

  assert.deepEqual(store.getUser(3), {
    id: 3,
    name: 'Grace Hopper',
    email: 'grace@example.com',
  });
});

test('updateUser updates only the name when only name is given', () => {
  const updated = store.updateUser(1, { name: 'Ada L.' });
  assert.deepEqual(updated, {
    id: 1,
    name: 'Ada L.',
    email: 'ada@example.com',
  });
  assert.deepEqual(store.getUser(1), {
    id: 1,
    name: 'Ada L.',
    email: 'ada@example.com',
  });
});

test('updateUser updates only the email when only email is given', () => {
  const updated = store.updateUser(1, { email: 'ada@newdomain.com' });
  assert.deepEqual(updated, {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@newdomain.com',
  });
  assert.deepEqual(store.getUser(1), {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@newdomain.com',
  });
});

test('updateUser updates both fields in one call', () => {
  const updated = store.updateUser(2, {
    name: 'Alan M. Turing',
    email: 'alan@bletchley.example.com',
  });
  assert.deepEqual(updated, {
    id: 2,
    name: 'Alan M. Turing',
    email: 'alan@bletchley.example.com',
  });
});

test('updateUser ignores undefined fields', () => {
  const updated = store.updateUser(1, { name: undefined, email: undefined });
  assert.deepEqual(updated, SEED[0]);
});

test('updateUser returns undefined for a non-existent id', () => {
  assert.equal(store.updateUser(999, { name: 'Nobody' }), undefined);
  assert.equal(store.listUsers().length, 2);
});

test('updateUser does not return a reference that can corrupt the stored record', () => {
  const updated = store.updateUser(1, { name: 'Ada L.' });
  updated.email = 'corrupted@example.com';

  assert.equal(store.getUser(1).email, 'ada@example.com');
});

test('reset restores a user modified by updateUser', () => {
  store.updateUser(1, { name: 'Changed', email: 'changed@example.com' });
  store.reset();

  assert.deepEqual(store.getUser(1), SEED[0]);
});

test('reset restores the user count and nextId after createUser', () => {
  store.createUser({ name: 'Temporary', email: 'temp@example.com' });
  assert.equal(store.listUsers().length, 3);

  store.reset();

  assert.equal(store.listUsers().length, 2);
  assert.deepEqual(store.listUsers(), SEED);

  const created = store.createUser({
    name: 'Grace Hopper',
    email: 'grace@example.com',
  });
  assert.equal(created.id, 3);
});
