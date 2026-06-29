const express = require('express');
const store = require('../db/store');
const requireAuth = require('../middleware/auth');

const router = express.Router({ mergeParams: true });
router.use(requireAuth);

// GET /users/:userId/bank-accounts — list all bank accounts for a user.
router.get('/', (req, res) => {
  const userId = Number(req.params.userId);
  const user = store.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(store.listBankAccounts(userId));
});

// POST /users/:userId/bank-accounts — create a bank account for a user.
router.post('/', (req, res) => {
  const userId = Number(req.params.userId);
  const user = store.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { accountNumber, bankName } = req.body;
  if (!accountNumber || !bankName) {
    return res.status(400).json({ error: 'accountNumber and bankName are required' });
  }
  const account = store.createBankAccount(userId, { accountNumber, bankName });
  return res.status(201).json(account);
});

// GET /users/:userId/bank-accounts/:id — fetch one bank account.
router.get('/:id', (req, res) => {
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  const user = store.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const account = store.getBankAccount(userId, id);
  if (!account) {
    return res.status(404).json({ error: 'Bank account not found' });
  }
  return res.json(account);
});

// DELETE /users/:userId/bank-accounts/:id — remove a bank account.
router.delete('/:id', (req, res) => {
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  const user = store.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const deleted = store.deleteBankAccount(userId, id);
  if (!deleted) {
    return res.status(404).json({ error: 'Bank account not found' });
  }
  return res.status(204).send();
});

module.exports = router;
