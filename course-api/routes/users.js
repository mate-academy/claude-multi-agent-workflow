const express = require('express');
const store = require('../db/store');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidName(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value);
}

// Number(':id') turns non-numeric ids into NaN, which happens to 404
// (NaN !== NaN in the store's lookup) rather than reporting a bad request.
// Validate explicitly so callers get a 400 for malformed ids.
function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) ? id : null;
}

// GET /users — list all users.
router.get('/', (req, res) => {
  res.json(store.listUsers());
});

// GET /users/:id — fetch one user, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a number' });
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
  if (!isValidName(name) || !isValidEmail(email)) {
    return res.status(400).json({ error: 'name and a valid email are required' });
  }
  if (store.listUsers().some((user) => user.email === email)) {
    return res.status(400).json({ error: 'email is already in use' });
  }
  const user = store.createUser({ name, email });
  return res.status(201).json(user);
});

// PUT /users/:id — update an existing user (added in Project 2).
router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a number' });
  }
  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }
  if (name !== undefined && !isValidName(name)) {
    return res.status(400).json({ error: 'name must be a non-empty string' });
  }
  if (email !== undefined && !isValidEmail(email)) {
    return res.status(400).json({ error: 'email must be a valid email address' });
  }
  const user = store.updateUser(id, { name, email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

module.exports = router;
