const test = require('node:test');
const assert = require('node:assert');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('listUsers returns a defensive copy of the array', () => {
  const list = store.listUsers();
  list.push({ id: 999, name: 'Intruder', email: 'intruder@example.com' });
  list.length = 0;

  const listAgain = store.listUsers();
  assert.equal(listAgain.length, 2);
  assert.equal(listAgain[0].name, 'Ada Lovelace');
});

test('listUsers returns copies of the individual user objects', () => {
  const list = store.listUsers();
  list[0].name = 'Mutated Name';

  const listAgain = store.listUsers();
  assert.equal(listAgain[0].name, 'Ada Lovelace');
});

test('getUser returns a defensive copy of the user object', () => {
  const user = store.getUser(1);
  user.name = 'Mutated Name';

  const userAgain = store.getUser(1);
  assert.equal(userAgain.name, 'Ada Lovelace');
});

test('updateUser still mutates the underlying record in place', () => {
  const updated = store.updateUser(1, { name: 'Ada L.' });
  assert.equal(updated.name, 'Ada L.');

  const fetched = store.getUser(1);
  assert.equal(fetched.name, 'Ada L.');
});

test('createUser returns a copy that cannot corrupt the stored record', () => {
  const created = store.createUser({ name: 'Grace Hopper', email: 'grace@example.com' });
  created.name = 'Mutated Name';

  const fetched = store.getUser(created.id);
  assert.equal(fetched.name, 'Grace Hopper');
});
