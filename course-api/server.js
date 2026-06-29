const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');
const tokensRouter = require('./routes/tokens');
const bankAccountsRouter = require('./routes/bankAccounts');

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/tokens', tokensRouter);
app.use('/users/:userId/bank-accounts', bankAccountsRouter);
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;

// Only start listening when run directly (e.g. `npm run dev`), so the tests
// can import the app without opening a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
