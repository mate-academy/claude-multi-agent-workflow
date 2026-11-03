const express = require('express');
const store = require('../db/store');

const router = express.Router();

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
// Basic shape check: something@something.something, no whitespace or extra "@".
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Parses a path id such as "7" or "007". Returns null for anything that is not
// a positive safe integer ("1.5", "1e0", " 1", "0x1", "abc", "0", "-1").
function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

// Returns an error message for an invalid name, or null if it is valid.
function checkName(name) {
  if (typeof name !== 'string') return 'name must be a string';
  const length = name.trim().length;
  if (length < 1 || length > MAX_NAME_LENGTH) {
    return `name must be 1-${MAX_NAME_LENGTH} characters`;
  }
  return null;
}

// Returns an error message for an invalid email, or null if it is valid.
function checkEmail(email) {
  if (typeof email !== 'string') return 'email must be a string';
  const trimmed = email.trim();
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return `email must be at most ${MAX_EMAIL_LENGTH} characters`;
  }
  if (!EMAIL_PATTERN.test(trimmed)) return 'email must be a valid email address';
  return null;
}

// GET /users — list all users.
router.get('/', (req, res) => {
  res.json(store.listUsers());
});

// GET /users/:id — fetch one user, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  const user = store.getUser(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

// POST /users — create a user. Requires name and email.
router.post('/', (req, res) => {
  const { name, email } = req.body || {};
  if (name === undefined || email === undefined) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const nameError = checkName(name);
  if (nameError) {
    return res.status(400).json({ error: nameError });
  }
  const emailError = checkEmail(email);
  if (emailError) {
    return res.status(400).json({ error: emailError });
  }
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  if (store.emailTaken(cleanEmail)) {
    return res.status(409).json({ error: 'email already in use' });
  }
  const user = store.createUser({ name: cleanName, email: cleanEmail });
  return res.status(201).json(user);
});

// PUT /users/:id — update an existing user (added in Project 2).
router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  if (!store.getUser(id)) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { name, email } = req.body || {};
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }
  const fields = {};
  if (name !== undefined) {
    const nameError = checkName(name);
    if (nameError) {
      return res.status(400).json({ error: nameError });
    }
    fields.name = name.trim();
  }
  if (email !== undefined) {
    const emailError = checkEmail(email);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }
    fields.email = email.trim();
  }
  if (fields.email !== undefined && store.emailTaken(fields.email, id)) {
    return res.status(409).json({ error: 'email already in use' });
  }
  const user = store.updateUser(id, fields);
  return res.json(user);
});

module.exports = router;
