const express = require('express');
const store = require('../db/store');

const router = express.Router();

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns an error message for the first invalid field given, or null if all are valid.
// Fields that are undefined are skipped, so PUT can send only the ones it changes.
function validateUserFields({ name, email }) {
  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return 'name must be a non-empty string';
  }
  if (email !== undefined && (typeof email !== 'string' || !EMAIL.test(email))) {
    return 'email must be a valid email address';
  }
  return null;
}

// Parses a route :id. Returns a positive integer, or null if it isn't one.
function parseId(raw) {
  return /^[1-9]\d*$/.test(raw) ? Number(raw) : null;
}

// GET /users — list all users.
router.get('/', (req, res) => {
  res.json(store.listUsers());
});

// GET /users/:id — fetch one user, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
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
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const invalid = validateUserFields({ name, email });
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }
  const user = store.createUser({ name, email });
  return res.status(201).json(user);
});

// PUT /users/:id — update an existing user (added in Project 2).
router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }
  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }
  const invalid = validateUserFields({ name, email });
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }
  const user = store.updateUser(id, { name, email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

module.exports = router;
