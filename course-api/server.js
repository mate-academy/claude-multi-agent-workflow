const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', usersRouter);

// Terminal 404 — nothing above matched the path.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler — catches JSON parse errors from express.json() and anything
// else that gets thrown, and always answers with the documented error shape.
// Express only treats a 4-arg function as error middleware, so `next` must
// stay in the signature even though this handler never calls it.
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
