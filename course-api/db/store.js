// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

const crypto = require('node:crypto');

let users = [];
let nextId = 1;
let tokens = new Map();

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;
}
seed();

function listUsers() {
  return users;
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

function updateUser(id, fields) {
  const user = getUser(id);
  if (!user) return undefined;
  if (fields.name !== undefined) user.name = fields.name;
  if (fields.email !== undefined) user.email = fields.email;
  return user;
}

function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;
  users.splice(index, 1);
  return true;
}

function getUserByEmail(email) {
  return users.find((user) => user.email === email);
}

function createToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, userId);
  return token;
}

function validateToken(token) {
  return tokens.get(token);
}

function deleteToken(token) {
  if (!tokens.has(token)) return false;
  tokens.delete(token);
  return true;
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
  tokens.clear();
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  createToken,
  validateToken,
  deleteToken,
  reset,
};
