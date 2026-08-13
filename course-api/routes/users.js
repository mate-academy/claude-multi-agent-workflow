const express = require('express');
const store = require('../db/store');

const router = express.Router();

// A valid id is a non-negative integer with no extra characters
// (Number(' 1 ') and Number('') are both falsy-safe but not intended ids).
function parseId(rawId) {
  if (!/^\d+$/.test(rawId)) return null;
  return Number(rawId);
}

// name/email must be actual non-empty strings, not just truthy values.
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// GET /users — list all users.
router.get('/', (req, res) => {
  res.json(store.listUsers());
});

// GET /users/:id — fetch one user, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a non-negative integer' });
  }
  const user = store.getUser(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

// POST /users — create a user. Requires name and email.
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const user = store.createUser({ name, email });
  return res.status(201).json(user);
});

// PUT /users/:id — update an existing user (added in Project 2).
router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a non-negative integer' });
  }
  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }
  if (name !== undefined && !isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name must be a non-empty string' });
  }
  if (email !== undefined && !isNonEmptyString(email)) {
    return res.status(400).json({ error: 'email must be a non-empty string' });
  }
  const user = store.updateUser(id, { name, email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

module.exports = router;
