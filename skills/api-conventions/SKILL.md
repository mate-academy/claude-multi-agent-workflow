---
name: api-conventions
description: Use whenever writing, editing, or reviewing an Express route, db/store.js, or a test in course-api — including adding a new endpoint — to keep the code aligned with this project's house rules for validation, status codes, error shape, and state ownership. Load before considering any change to course-api "done".
---

course-api has a small, consistent house style. Code that drifts from it is what the plugin's `code-reviewer` subagent flags and `quality-fixer` fixes — following it up front avoids that round-trip.

## Rules

1. **Validate before use.** Any route reading `req.body` or `req.params` must validate first and return `400` with `{ "error": "message" }` on bad input — never let invalid input reach `db/store.js`.
2. **404 on missing records.** Any lookup by id that finds nothing returns `404` with `{ "error": "message" }`. Don't let a missing record fall through to a 200 with `null`/`undefined`.
3. **Error shape is fixed.** Every error response is exactly `{ "error": "message" }` — no extra fields, no arrays, no bare strings.
4. **All state goes through `db/store.js`.** Routes never hold their own state (module-level arrays, caches, etc.); they call the store helpers. If a new kind of data needs to be tracked, add the helper to `db/store.js` rather than reaching around it.
5. **One route file per resource**, mounted in `server.js` under its base path — don't add unrelated endpoints to an existing resource's file.
6. **No unused vars.** `eslint.config.js` enforces `no-unused-vars` (route handler args `req`/`res`/`next` are exempt). Remove dead imports and variables rather than prefixing them to silence the linter.
7. **Every new route gets a test** in `course-api/tests/`, covering both its success path and its error path(s) (the `400`/`404` cases), following the existing test file's style.

## Before calling a change done

Run, from inside `course-api/`:
```
npm run lint
npm test
```
Both must pass. If either doesn't, fix the code — don't silence the linter or skip the failing test.
