// Entry point: creates the Express app, mounts the resource routers, and starts the server.
const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');
const ordersRouter = require('./routes/orders');

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);

const PORT = process.env.PORT || 3000;

// Only start listening when run directly (e.g. `npm run dev`), so the tests
// can import the app without opening a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
