---
name: code-quality-checklist
description: Use when reviewing, writing, or modifying routes/handlers in this repo's course-api (or a similarly-shaped small Express/Node service) — codifies the project's own conventions so review and tests stay consistent instead of relying on each agent's judgment call.
---

# Code quality checklist for Express-style route projects

Apply this checklist whenever you touch a route file, its tests, or review someone else's change to one. It exists so `code-reviewer` and `test-writer` (and anyone editing by hand) hold the code to the same bar instead of drifting apart.

## Routes
- One route file per resource, mounted in `server.js` under its base path — never two resources in one file.
- All reads/writes go through the resource's store module (e.g. `db/store.js`) — a route handler never holds state itself.
- Any route that accepts a body validates the required fields and returns `400` with `{ "error": "message" }` if they're missing.
- Any route that looks up a record by id returns `404` with `{ "error": "message" }` when the record doesn't exist — check this before using the record.
- Error responses are always JSON shaped `{ "error": "message" }` — never a bare string or a different key.

## Tests
- Tests live in `tests/`, one file per resource, using `node:test` + `assert` + `supertest` against the exported `app` (never a real listening port).
- `test.beforeEach(() => store.reset())` resets state so tests don't leak into each other — every new test file needs this.
- Minimum coverage per route: the happy path, the `400` validation-failure case (if it accepts a body), and the `404` missing-record case (if it looks up by id).

## Lint
- Don't flag anything ESLint's `no-unused-vars` / recommended rules would already catch in review — that's the hook's job, not a reviewer's.
