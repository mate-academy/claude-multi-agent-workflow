---
name: code-quality-conventions
description: Use when reviewing or fixing code in course-api to check it against the project's code quality conventions (routing, data access, validation, error shape).
---

# Code quality conventions for course-api

Reference these conventions when reviewing or fixing code in `course-api/`:

- One route file per resource in `routes/`, mounted in `server.js` under its base path.
- All data access goes through `db/store.js` — routes never hold state directly.
- Validate input in the route: return `400` on bad input, `404` when a record is missing.
- Error responses are JSON in the shape `{ "error": "message" }`.
- Run `npm run lint` in `course-api/` to check against the project's ESLint rules.

A finding is a code quality issue if it violates one of these conventions, introduces a bug, or leaves an error/edge case unhandled.
