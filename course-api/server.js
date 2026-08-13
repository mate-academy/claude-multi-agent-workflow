const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', usersRouter);

// Catch-all for unmatched routes — keeps 404s in the { error } JSON shape
// instead of falling through to Express's default HTML 404 page.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler — keeps all errors (e.g. malformed JSON bodies
// rejected by express.json()) in the { error } JSON shape instead of
// Express's default HTML error page.
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

// Only start listening when run directly (e.g. `npm run dev`), so the tests
// can import the app without opening a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
