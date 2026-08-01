# Course API — Code Quality Audit Report

Three parallel reviews covered `routes/server`, `db/models`, and `tests`. Findings below are deduplicated and grouped by severity.

## High

1. **No JSON error-handling middleware for malformed requests** — `course-api/server.js` (no error middleware after the routers). A malformed JSON body makes `express.json()` throw, falling through to Express's default HTML handler instead of the documented `{ "error": "message" }` shape, and can leak stack traces. Add a 4-arg JSON error handler.

2. **`listUsers()` exposes the live internal array** — `course-api/db/store.js:16-18`. Returns `users` by reference; callers can mutate the store directly, bypassing `createUser`/`updateUser`. Fix: return `[...users]`.

3. **Hardcoded `nextId` in `seed()`** — `course-api/db/store.js:12`. Not derived from seed data; editing the seed array without updating this literal causes id collisions. Fix: derive from `Math.max(...users.map(u => u.id)) + 1`.

4. **POST /users 400 path untested** — `course-api/tests/users.test.js`, logic at `routes/users.js:22-25`, documented at `docs/api.md:31`. No test covers missing `name`/`email` → `400`.

5. **PUT /users/:id 400 path untested** — `course-api/tests/users.test.js`, logic at `routes/users.js:32-35`, documented at `docs/api.md:34`. No test covers neither field given → `400`.

## Medium

6. **No catch-all 404 handler** — `course-api/server.js`. Unmatched routes return Express's default HTML 404, not the documented JSON error shape.

7. **PUT /users/:id accepts explicit falsy/invalid values and silently corrupts records** — `routes/users.js:32-36` only checks against `undefined`; `db/store.js:24-29,31-37` (`createUser`/`updateUser`) do no validation of their own. `{ "name": null }` or non-string types pass straight through. (Flagged independently by both the routes and db reviews — same underlying gap.)

8. **No duplicate-email check in `createUser`** — `db/store.js:24-29`. Uniqueness policy undocumented and unenforced.

9. **PUT test doesn't verify untouched fields survive a partial update** — `tests/users.test.js:30-34`. Only asserts `name` changed, never that `email` was preserved; wouldn't catch a regression in `store.js:34-35`.

10. **No happy-path test for GET /users/:id** — `tests/users.test.js`. Only the 404 case (lines 16-19) is covered.

11. **POST test never asserts created user's email** — `tests/users.test.js:21-28`. Checks `name`/`id` but not `email`.

## Low

12. **Non-numeric `:id` handling is incidental and untested** — `routes/users.js:12-13,36` (`Number()` → `NaN`), `db/store.js:20-22` (no documented input contract), `tests/users.test.js` (no test for e.g. `/users/abc`). Currently "works" only because `NaN !== NaN` in `find`. (Flagged independently by all three reviews — same gap.)

13. **POST /users accepts weakly-typed input** — `routes/users.js:22-25`. Only truthiness-checked; accepts non-strings, whitespace-only strings, no email format check.

14. **`reset()` is a redundant wrapper around `seed()`** — `db/store.js:40-42`.

15. **Generic parameter name in `updateUser`** — `db/store.js:31`. `fields` → `updates`/`patch` would be clearer.

16. **Weak assertion on created user id** — `tests/users.test.js:27`. `assert.ok(res.body.id)` passes for any truthy value; wouldn't catch a falsy-but-valid id like `0`.

## Notes

No unclear-naming issues found in `routes/health.js`, `routes/users.js`, or `tests/users.test.js`, beyond item 15 (in `db/store.js`).
