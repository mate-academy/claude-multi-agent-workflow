---
name: api-conventions
description: Checklist of course-api's Express conventions (route structure, input validation, 404 handling, JSON error shape, data access through db/store.js). Use when reviewing routes or writing/updating tests for course-api, so checks and test cases match the project's actual rules instead of generic assumptions.
---

# course-api conventions

A shared checklist for anyone reviewing or testing routes in `course-api/`. Source of truth: `course-api/CLAUDE.md`.

## Route structure
- One route file per resource (`routes/users.js`, `routes/health.js`), each exporting an Express router.
- Each router is mounted in `server.js` under its base path.

## Data access
- All reads and writes go through `db/store.js`. A route handler never holds state directly or mutates data inline.

## Validation and status codes
- Required input is validated in the route handler itself.
- Missing or invalid input → `400`.
- A requested record that doesn't exist → `404`.
- Successful creation → `201`; successful read/update → `200`.

## Error shape
- Every error response body is JSON of the exact shape `{ "error": "message" }` — no extra fields, no plain-text errors, no inconsistent key names across routes.

## Using this checklist
- **Reviewing a route**: confirm each item above holds for the changed code; flag any mismatch with the specific rule it breaks.
- **Writing a test**: write one test case per item above that the route under test is actually subject to (e.g. a `GET` with no body doesn't need a 400-on-missing-input case, but a `POST`/`PUT` does).
