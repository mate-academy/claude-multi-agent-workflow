const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', usersRouter);

// Handles malformed JSON bodies (body-parser sets err.type = 'entity.parse.failed').
// Any other error is passed on unchanged to Express's default handler.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON' });
  }
  return next(err);
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
