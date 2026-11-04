const express = require('express');
const store = require('../db/store');

const router = express.Router();

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';
const isEmail = (v) => isNonEmptyString(v) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Reject anything that isn't a plain positive integer id with 400.
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  return next();
});

// GET /users — list all users.
router.get('/', (req, res) => {
  res.json(store.listUsers());
});

// GET /users/:id — fetch one user, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const user = store.getUser(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

// POST /users — create a user. Requires name and email.
router.post('/', (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  if (!isNonEmptyString(name) || !isEmail(email)) {
    return res.status(400).json({ error: 'name must be a string and email must be a valid email' });
  }
  const user = store.createUser({ name: name.trim(), email: email.trim() });
  return res.status(201).json(user);
});

// PUT /users/:id — update an existing user (added in Project 2).
router.put('/:id', (req, res) => {
  const { name, email } = req.body || {};
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }
  if (name !== undefined && !isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name must be a non-empty string' });
  }
  if (email !== undefined && !isEmail(email)) {
    return res.status(400).json({ error: 'email must be a valid email' });
  }
  const user = store.updateUser(Number(req.params.id), { name, email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

module.exports = router;
