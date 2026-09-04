const express = require('express');
const store = require('../db/store');

const router = express.Router();

// A valid id is a positive integer (no NaN, no decimals, no negatives).
function parseId(raw) {
  if (!/^\d+$/.test(raw)) return undefined;
  const id = Number(raw);
  return id > 0 ? id : undefined;
}

// A valid string field is present and non-empty once trimmed.
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
  if (id === undefined) {
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
  if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const user = store.createUser({ name, email });
  return res.status(201).json(user);
});

// PUT /users/:id — update an existing user (added in Project 2).
router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === undefined) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }

  const fields = {};
  if (name !== undefined) {
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: 'name must be a non-empty string' });
    }
    fields.name = name;
  }
  if (email !== undefined) {
    if (!isNonEmptyString(email)) {
      return res.status(400).json({ error: 'email must be a non-empty string' });
    }
    fields.email = email;
  }

  const user = store.updateUser(id, fields);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

module.exports = router;
