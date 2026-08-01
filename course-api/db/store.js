// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
}
seed();

// Internal lookup that returns the live record, for functions in this file
// that need to mutate it. Every function exported below returns a copy
// instead, so callers can't reach back in and mutate the store directly.
function findUser(id) {
  return users.find((user) => user.id === id);
}

function listUsers() {
  return users.map((user) => ({ ...user }));
}

function getUser(id) {
  const user = findUser(id);
  return user ? { ...user } : undefined;
}

function createUser({ name, email }) {
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return { ...user };
}

function updateUser(id, updates) {
  const user = findUser(id);
  if (!user) return undefined;
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.email !== undefined) user.email = updates.email;
  return { ...user };
}

// seed() also serves as the public reset — tests call it between each test.
module.exports = { listUsers, getUser, createUser, updateUser, reset: seed };
