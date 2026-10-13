const test = require('node:test');
const assert = require('node:assert');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('store.getUser returns undefined for a missing id', () => {
  assert.equal(store.getUser(999), undefined);
});

test('store.createUser assigns the next id', () => {
  const user = store.createUser({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(user.id, 3);
  assert.equal(store.getUser(3).name, 'Grace Hopper');
});

test('store.updateUser returns undefined for a missing id', () => {
  assert.equal(store.updateUser(999, { name: 'Nobody' }), undefined);
});

test('store.reset restores the seed data after changes', () => {
  store.createUser({ name: 'Grace Hopper', email: 'grace@example.com' });
  store.reset();
  assert.equal(store.listUsers().length, 2);
  const next = store.createUser({ name: 'Linus Torvalds', email: 'linus@example.com' });
  assert.equal(next.id, 3);
});

test('store.getUser returns a copy, not the internal record', { todo: true }, () => {
  const user = store.getUser(1);
  user.name = 'Mutated';
  assert.equal(store.getUser(1).name, 'Ada Lovelace');
});

test('store.listUsers returns a copy of the list', { todo: true }, () => {
  const list = store.listUsers();
  list.push({ id: 99, name: 'Injected', email: 'x@example.com' });
  list[0].name = 'Mutated';
  assert.equal(store.listUsers().length, 2);
  assert.equal(store.getUser(1).name, 'Ada Lovelace');
});

test('store.updateUser returns a copy, not the internal record', { todo: true }, () => {
  const updated = store.updateUser(1, { name: 'Ada L.' });
  updated.name = 'Mutated';
  assert.equal(store.getUser(1).name, 'Ada L.');
});

test('store.createUser returns a copy, not the internal record', { todo: true }, () => {
  const created = store.createUser({ name: 'Grace Hopper', email: 'grace@example.com' });
  created.name = 'Mutated';
  assert.equal(store.getUser(3).name, 'Grace Hopper');
});
