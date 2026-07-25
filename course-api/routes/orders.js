const express = require('express');
const store = require('../db/store');

const router = express.Router();

function isValidQuantity(quantity) {
  return Number.isInteger(quantity) && quantity > 0;
}

// GET /orders — list all orders.
router.get('/', (req, res) => {
  res.json(store.listOrders());
});

// GET /orders/:id — fetch one order, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const order = store.getOrder(Number(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(order);
});

// POST /orders — create an order. Requires userId and item; quantity defaults to 1.
router.post('/', (req, res) => {
  const { userId, item, quantity } = req.body;
  if (!userId || typeof item !== 'string' || !item) {
    return res.status(400).json({ error: 'userId and item are required' });
  }
  const numericUserId = Number(userId);
  if (!store.getUser(numericUserId)) {
    return res.status(400).json({ error: 'userId does not match an existing user' });
  }
  if (quantity !== undefined && !isValidQuantity(quantity)) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }
  const order = store.createOrder({
    userId: numericUserId,
    item,
    quantity: quantity === undefined ? 1 : quantity,
  });
  return res.status(201).json(order);
});

// PUT /orders/:id — update an existing order.
router.put('/:id', (req, res) => {
  const { userId, item, quantity } = req.body;
  if (userId === undefined && item === undefined && quantity === undefined) {
    return res.status(400).json({ error: 'userId, item, or quantity is required' });
  }
  const existing = store.getOrder(Number(req.params.id));
  if (!existing) {
    return res.status(404).json({ error: 'Order not found' });
  }
  let numericUserId;
  if (userId !== undefined) {
    numericUserId = Number(userId);
    if (!store.getUser(numericUserId)) {
      return res.status(400).json({ error: 'userId does not match an existing user' });
    }
  }
  if (item !== undefined && (typeof item !== 'string' || !item)) {
    return res.status(400).json({ error: 'item must be a non-empty string' });
  }
  if (quantity !== undefined && !isValidQuantity(quantity)) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }
  const order = store.updateOrder(existing.id, { userId: numericUserId, item, quantity });
  return res.json(order);
});

module.exports = router;
