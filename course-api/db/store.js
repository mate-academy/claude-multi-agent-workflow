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

// Internal lookup that returns the live object so in-place mutation works.
// Never expose this return value outside this module — external callers
// must only ever see copies (see getUser/listUsers below).
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

function updateUser(id, fields) {
  const user = findUser(id);
  if (!user) return undefined;
  if (fields.name !== undefined) user.name = fields.name;
  if (fields.email !== undefined) user.email = fields.email;
  return { ...user };
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
}

module.exports = { listUsers, getUser, createUser, updateUser, reset };
