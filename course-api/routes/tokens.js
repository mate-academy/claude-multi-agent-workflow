const express = require('express');
const store = require('../db/store');

const router = express.Router();

// POST /tokens — issue a bearer token for a user identified by email.
router.post('/', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }
  const user = store.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = store.createToken(user.id);
  return res.status(201).json({ token });
});

// DELETE /tokens/:token — revoke a token.
router.delete('/:token', (req, res) => {
  const removed = store.deleteToken(req.params.token);
  if (!removed) {
    return res.status(404).json({ error: 'Token not found' });
  }
  return res.status(204).send();
});

module.exports = router;
