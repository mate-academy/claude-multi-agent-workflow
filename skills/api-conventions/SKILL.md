---
name: api-conventions
description: "Use when reviewing, writing, or fixing code under course-api/routes, course-api/db, or course-api/tests — covers input-validation rules, the { \"error\": \"message\" } response shape, the routes-only-through-db/store.js rule, and where new tests belong."
---

# course-api conventions

- One route file per resource, mounted in server.js under its base path.
- All reads/writes go through db/store.js — routes never hold state directly.
- Validate input in the route: return 400 with `{ "error": "message" }` on bad/missing input, before touching the store.
- Return 404 with `{ "error": "message" }` when a record doesn't exist.
- Tests use node:test + supertest, with `test.beforeEach(() => store.reset())` so each test starts clean.
- Every route needs both a happy-path test and its error-path test(s) (400 for bad input, 404 for missing records) in tests/<resource>.test.js.

## Quick self-check
- [ ] Bad input → 400, `{ "error": "..." }`, before any store call
- [ ] Missing record → 404, `{ "error": "..." }`
- [ ] No direct state in the route — only db/store.js
- [ ] Happy path *and* error path both covered in tests/
