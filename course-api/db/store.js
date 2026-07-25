// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

let orders = [];
let nextOrderId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;

  orders = [
    { id: 1, userId: 1, item: 'Analytical Engine plans', quantity: 1 },
    { id: 2, userId: 2, item: 'Enigma decoder', quantity: 2 },
  ];
  nextOrderId = 3;
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

function listOrders() {
  return orders;
}

function getOrder(id) {
  return orders.find((order) => order.id === id);
}

function createOrder({ userId, item, quantity }) {
  const order = { id: nextOrderId, userId, item, quantity };
  nextOrderId += 1;
  orders.push(order);
  return order;
}

function updateOrder(id, fields) {
  const order = getOrder(id);
  if (!order) return undefined;
  if (fields.userId !== undefined) order.userId = fields.userId;
  if (fields.item !== undefined) order.item = fields.item;
  if (fields.quantity !== undefined) order.quantity = fields.quantity;
  return order;
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  reset,
};
