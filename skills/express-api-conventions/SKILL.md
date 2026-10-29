---
name: express-api-conventions
description: Conventions for Express REST APIs (routes, validation, status codes, error shape, tests). Use when writing, reviewing or testing an Express route or its tests.
---

# Express API conventions

Apply these rules when you write, review or test Express route code. A project's own `CLAUDE.md` wins where it disagrees.

## Routes
- One router file per resource in `routes/`, mounted in `server.js` under its base path (`/users` → `routes/users.js`).
- Routes never hold state. All reads and writes go through the data helper (e.g. `db/store.js`).
- Convert path params explicitly (`Number(req.params.id)`) and treat a non-numeric id as "not found" (`404`) or bad input (`400`) — never pass `NaN` on silently.

## Status codes
| Situation | Status |
|---|---|
| Read OK / update OK | `200` |
| Created | `201` |
| Deleted, no body | `204` |
| Missing or invalid input | `400` |
| Record not found | `404` |

## Errors
- Always JSON: `res.status(code).json({ error: 'message' })`.
- Messages are short and human-readable: `'User not found'`, `'name and email are required'`.

## Tests
- Use `node:test`, `node:assert` and `supertest` against the exported `app` (no listening server).
- Call `store.reset()` in `test.beforeEach` so tests are independent.
- One `test(...)` per behaviour; title format: `METHOD /path <does what> [for <case>]`.
- Every route needs at least: a success test, a `404` test (if it takes an id), and a `400` test per validation branch.

## Checklist
- [ ] Input validated, `400` on bad input
- [ ] `404` when the record is missing
- [ ] Error body is `{ "error": "..." }`
- [ ] Data access only via the store
- [ ] Success, `400` and `404` paths each have a test
