// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = Math.max(...users.map((user) => user.id)) + 1;
}
seed();

function listUsers() {
  return [...users];
}

function getUser(id) {
  return users.find((user) => user.id === id);
}

function createUser({ name, email }) {
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return user;
}

function updateUser(id, updates) {
  const user = getUser(id);
  if (!user) return undefined;
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.email !== undefined) user.email = updates.email;
  return user;
}

// seed() also serves as the public reset — tests call it between each test.
module.exports = { listUsers, getUser, createUser, updateUser, reset: seed };
