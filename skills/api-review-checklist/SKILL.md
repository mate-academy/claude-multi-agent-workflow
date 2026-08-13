---
name: api-review-checklist
description: Checklist of course-api's conventions (input validation, status codes, error shape, data-access rules) for reviewing or writing Express route code. Use whenever reviewing, writing, or auditing routes in course-api.
---

Use this checklist whenever you're reviewing, writing, or fixing a route handler in `course-api/`. It mirrors the conventions in `course-api/CLAUDE.md`.

## Request handling
- Bad input (missing/malformed fields) returns `400`, not a 500 or a silent default.
- A lookup for a record that doesn't exist returns `404`, not `200` with `null`/`undefined`.
- Successful writes return the resource and an appropriate status (`200`/`201`).

## Error shape
- Every error response body is JSON in the exact shape `{ "error": "message" }` — no extra fields, no plain-text errors, no stack traces leaking to the client.

## Data access
- Routes never hold or mutate state directly — all reads and writes go through `db/store.js`.
- No route reaches into another route's data by importing it directly; shared logic lives in `db/store.js`.

## Wiring
- Every route file exports an Express router and is mounted in `server.js` under its correct base path.
- New route files follow the existing one-file-per-resource pattern (see `routes/users.js`, `routes/health.js`).

## Tests
- Each route has `node --test` + `supertest` coverage for at least: the happy path, a `400` case, and a `404` case where applicable.
