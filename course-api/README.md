# Course API

This is the example project your plugin tests against — the small Express API from the earlier projects. Your subagents and workflow command should operate on this code: review it, run its tests, and so on.

## Run it

- `npm install` — install dependencies
- `npm test` — run the test suite
- `npm run dev` — start the API on http://localhost:3000

The code lives in `server.js`, `routes/`, and `db/`; the tests are in `tests/`.
