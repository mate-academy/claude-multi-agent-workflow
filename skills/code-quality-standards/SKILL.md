---
name: code-quality-standards
description: Use when reviewing, fixing, or writing code in course-api — captures this project's lint rules, error-handling conventions, and test patterns so review findings and fixes match how the codebase actually works instead of generic best practices.
---

# Code quality standards for course-api

Reference this before flagging or fixing anything in `course-api/`, so findings match the project's actual conventions rather than generic advice.

## Lint

- Config: `course-api/eslint.config.js`, built on `@eslint/js` recommended rules plus one project rule: `no-unused-vars` is a **warning**, and `req`/`res`/`next` are always allowed as unused args (Express handler signatures).
- Run with `npm run lint` from `course-api/`. Auto-fixable issues: `npm run lint -- --fix`.
- Module system is CommonJS (`require`/`module.exports`), not ESM — don't flag `require()` as outdated, and don't introduce `import`/`export` syntax.

## Error handling & routes

- Routes live in `routes/`, data access in `db/`. A route handler that looks up a resource by id and doesn't find it should return **404**, not throw or return 500.
- Validate request bodies before using their fields; a missing required field on create/update should return **400**, not proceed with `undefined` values.
- Prefer returning early on the error case over nesting the success path in an `else`.

## Tests

- Tests use Node's built-in `node:test` + `node:assert`, and `supertest` against the exported `app` from `server.js` — not Jest/Mocha/Chai.
- Every test file resets state with `test.beforeEach(() => store.reset())` so tests don't leak data between each other. Any new test file needs this too if it touches `db/store`.
- One `test(...)` block per behavior (a status code + shape assertion), matching the pattern in `tests/users.test.js`: assert `res.status`, then assert the relevant fields of `res.body`.
- A route with no test in `tests/` covering both its success and its 404/400 path is a coverage gap worth flagging.

## When reviewing

Weigh findings against these conventions specifically — e.g. an unused `req` in a handler is not a violation (it's exempted), but an unused variable anywhere else is.

## When fixing

Match existing style exactly: CommonJS requires at the top of the file, early-return error handling, and the `node:test`/`supertest` pattern above for any new or updated test.
