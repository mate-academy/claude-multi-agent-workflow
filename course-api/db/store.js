// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;
}
seed();

function listUsers() {
  return users.map((user) => ({ ...user }));
}

function getUser(id) {
  const user = users.find((user) => user.id === id);
  return user ? { ...user } : undefined;
}

function createUser({ name, email }) {
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return { ...user };
}

function updateUser(id, fields) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;
  const updated = { ...users[index], ...fields };
  users[index] = updated;
  return { ...updated };
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
}

module.exports = { listUsers, getUser, createUser, updateUser, reset };
