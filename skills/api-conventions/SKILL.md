---
name: api-conventions
description: Reference for course-api's REST conventions (error shape, validation rules, route layout, test patterns) — use whenever reviewing, writing routes for, or testing course-api so output matches its existing style.
---

# course-api conventions

`course-api/` is a small Express API. Use these conventions whenever reading, reviewing, or extending it.

## Layout
- `server.js` — creates the app, mounts routers, listens on `PORT` (default 3000)
- `routes/<resource>.js` — one Express router per resource, mounted in `server.js`
- `db/store.js` — the only place that holds state; routes never mutate data directly

## Request/response rules
- Validate input in the route: return `400` for missing/invalid input, `404` when a record doesn't exist
- Error responses are always `{ "error": "message" }`
- A user looks like `{ "id": 1, "name": "...", "email": "..." }`

## Testing
- Tests live in `course-api/tests/*.test.js`, using Node's built-in `node:test` + `node:assert` + `supertest`
- Import the app with `require('../server')`, the store with `require('../db/store')`
- Call `store.reset()` in `test.beforeEach` so tests don't leak state between each other
- Cover the success path plus the `400` and `404` branches for each route

## Commands
- `npm run dev` — start the API on port 3000
- `npm test` — run the test suite
- `npm run lint` — lint with ESLint
