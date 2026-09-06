---
name: route-conventions
description: Use when adding, changing, or removing an Express route in course-api/routes/*.js. Applies course-api's conventions (input validation, 400 on bad input, 404 on a missing record, JSON error shape { "error": "message" }, data access only through course-api/db/store.js) and flags when the change needs a matching test in course-api/tests/.
---
`course-api` repeats the same shape every time a route changes. A route
edit here isn't done at the route file — treat it as touching two things
together:

1. **The route** (`course-api/CLAUDE.md` conventions):
   - Validate input in the handler; return `400` for invalid or missing
     input, `404` when the record doesn't exist.
   - Error responses are JSON: `{ "error": "message" }`.
   - Data access only through `course-api/db/store.js` — never hold state
     directly in the route.

2. **`course-api/db/store.js`** — add or update the helper the route
   needs there, following the existing plain-function style over the
   in-memory `users` array.

Before considering a route change finished, check whether
`course-api/tests/users.test.js` (or the relevant test file) already
covers the happy path and the `4xx` case(s) for what changed. If it
doesn't, that's a job for the `test-writer` subagent — or run
`/ship-check` to have the whole review + test-coverage workflow handle it
in one pass, rather than leaving the gap for someone else to notice
later.
