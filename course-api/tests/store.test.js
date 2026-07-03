const test = require('node:test');
const assert = require('node:assert');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('mutating the array returned by listUsers() does not change the store (real defect: live reference)', () => {
  const list = store.listUsers();
  list.pop();
  assert.equal(store.listUsers().length, 2);
});

test('mutating the object returned by getUser() does not change the store (real defect: live reference)', () => {
  const user = store.getUser(1);
  user.name = 'Hacked';
  assert.equal(store.getUser(1).name, 'Ada Lovelace');
});
