const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', usersRouter);

// Unknown routes get the same JSON error shape as everything else.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Errors thrown by middleware (e.g. malformed JSON from express.json()) or routes.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status < 500 ? err.message : 'Internal server error' });
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
