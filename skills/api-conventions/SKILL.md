---
name: api-conventions
description: Reference for course-api's Express conventions — input validation, HTTP status codes, error response shape, and file layout. Load this before reviewing, writing, or reasoning about any route in course-api.
---

# course-api conventions

`course-api` is a small Express API. Every route in it follows the same rules; use this reference instead of guessing at the pattern from a single file.

## File layout

- `server.js` — creates the Express app, mounts every router, starts the server. Nothing else lives here.
- `routes/<resource>.js` — one file per resource, exporting an `express.Router()`. A resource never spans multiple files, and a file never handles more than one resource.
- `db/store.js` — the only place data is read or written. Routes call into it; they never hold state themselves.
- `tests/` — Node's built-in test runner (`node --test`), typically driving the API with `supertest`.

## Request handling rules

- **Validate before acting.** Check required fields at the top of the handler. If something required is missing or invalid, respond immediately — don't call into the store with bad data.
- **Status codes**: `400` for bad/missing input, `404` when a lookup by id finds nothing, `201` for a successful creation, `200` for a successful read/update.
- **Error shape**: every error response body is exactly `{ "error": "<human-readable message>" }` — no other key name, no arrays, no nested objects.
- **Success shape**: return the resource (or list of resources) as plain JSON, matching whatever shape `db/store.js` returns.

## Commands

- `npm install` — install dependencies (run once after cloning).
- `npm run dev` — start the API on `http://localhost:3000`.
- `npm test` — run the test suite.
- `npm run lint` — run ESLint over `server.js`, `routes/`, `db/`, and `tests/`.
