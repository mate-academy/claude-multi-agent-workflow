---
name: api-conventions
description: Use when reviewing, writing, or fixing route or data-access code in an Express API that follows this project's pattern (course-api and similar) — checking request validation, status codes, error shape, and data-access boundaries against the project's own conventions rather than generic best practice.
---

# API conventions

This project (course-api, and anything built the same way) follows a small, consistent
set of conventions. Apply these — don't substitute generic REST/Express advice — when
reviewing, writing, or fixing code in `routes/` or `db/`.

## Route structure
- One route file per resource (e.g. `routes/users.js`), each exporting an Express
  `Router`. Mount it in `server.js` under its base path. A new resource gets a new
  file, not a new block in an existing one.

## Data access
- All reads and writes go through the store module (`db/store.js`). Routes never hold
  state directly or reach into another resource's data structures. If a route needs
  data, it calls a store function — if the store doesn't have one yet, add it there,
  not inline in the route.

## Validation and status codes
- Validate input in the route handler itself.
- Bad input (missing/malformed fields, wrong types) → `400`.
- A record that doesn't exist → `404`.
- Anything else expected-but-invalid → the most specific 4xx that applies; don't
  default everything to 400 or 500.

## Error shape
- Every error response is JSON of the exact shape `{ "error": "message" }` — no extra
  fields, no plain-text errors, no leaking stack traces.

## Applying this skill
When reviewing code, check each of the above in order and call out the first place a
file departs from it. When writing or fixing code, follow the pattern of the nearest
existing route file rather than introducing a new style.
