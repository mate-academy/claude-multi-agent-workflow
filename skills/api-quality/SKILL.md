---
name: api-quality
description: Rubric for reviewing Express API route files for code quality issues.
---

When reviewing Express API code, check for each of the following:

## Input validation
- Route handlers that accept user input (POST/PUT body, URL params) must validate before using the value.
- Missing or invalid input must return a `400` with `{ "error": "..." }`.

## Consistent error shape
- All error responses must use the shape `{ "error": "<message>" }` — no plain strings, no `message` keys.

## Correct status codes
- Successful creation: `201`. Successful read/update: `200`. Not found: `404`. Bad input: `400`.

## Route file structure
- One route file per resource (e.g. `routes/users.js`, `routes/health.js`). No mixed resources in one file.
- All data access goes through `db/store.js` — no inline data arrays in route files.

## Return these findings grouped by severity: high, medium, low.
