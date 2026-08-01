const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');

const app = express();
app.use(express.json({ limit: '100kb' }));

app.use('/health', healthRouter);
app.use('/users', usersRouter);

// Catch-all for unmatched routes, so clients get the documented JSON error
// shape instead of Express's default HTML 404 page.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Catches malformed JSON bodies (express.json() throws before any route
// runs) as well as anything else thrown in a route, so every error response
// stays JSON in the { error } shape instead of Express's default HTML page.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 3000;

// Only start listening when run directly (e.g. `npm run dev`), so the tests
// can import the app without opening a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
