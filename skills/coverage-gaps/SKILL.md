---
name: coverage-gaps
description: Find which course-api routes, status codes, and edge cases have no test, by comparing routes/ against tests/. Use when asked to check test coverage, find untested code paths, or before adding a new route in course-api.
---

# Finding coverage gaps in course-api

`course-api` has no coverage tool configured (`npm test` runs Node's built-in test runner with no `--coverage` reporting), so gaps are found by direct comparison rather than a report.

## Steps

1. Read every router file under `course-api/routes/` and list each route as `METHOD path` (e.g. `GET /users/:id`).
2. For each route, note every distinct outcome the handler can produce: success status/body, each validation failure (`400`), and each not-found case (`404`).
3. Read `course-api/tests/*.test.js` and list which of those outcomes already have an assertion.
4. Diff the two lists. A route is a gap if it has no test at all; an outcome is a gap if the route is tested but that specific branch (a particular 400 condition, a particular 404 case) is not.
5. Report gaps grouped by route, each with a one-line suggested test case (input → expected status/body) concrete enough to write directly, e.g.:
   - `POST /users` with only `email` (no `name`) → expect `400`.
   - `GET /health` → expect `200` and a `status` field — currently has zero tests.

## Notes

- Don't propose tests for behavior that doesn't exist yet — only cover what the current route handlers actually do.
- If a new route file is added, re-run this comparison against it before considering the feature done.
