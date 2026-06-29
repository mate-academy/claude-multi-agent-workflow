const store = require('../db/store');

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice('Bearer '.length);
  const userId = store.validateToken(token);
  if (userId === undefined) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  return next();
}

module.exports = requireAuth;
