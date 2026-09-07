# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A small Express API used as the working project throughout the Claude Code course.

## Commands
- `npm run dev` / `npm start` — start the API locally on port 3000 (`PORT` env var overrides)
- `npm test` — run the full test suite (Node's built-in test runner + supertest)
- `node --test tests/users.test.js` — run a single test file
- `npm run lint` — lint the codebase with ESLint

## Architecture
- `server.js` — entry point; creates the Express app, mounts the routers, and only calls `app.listen` when run directly (`require.main === module`), so tests can import `app` without binding a port
- `routes/` — one file per resource (`users.js`, `health.js`), each exporting an Express router; handlers double as controllers, there's no separate controller/model layer
- `db/store.js` — the in-memory data helper that every route reads and writes through; its `reset()` reseeds the sample data and is called from `test.beforeEach` for test isolation

## Conventions
- One route file per resource; mount it in `server.js` under its base path
- All data access goes through `db/store.js` — routes never hold state directly
- Validate input in the route and return `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`
