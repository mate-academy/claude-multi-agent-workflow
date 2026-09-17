---
name: code-review-checklist
description: Use when reviewing or writing Express routes in course-api (or a similarly-structured API), to check the change against the project's own conventions instead of generic best practices.
---

# Code review checklist (course-api conventions)

This project (`course-api`) follows a small, consistent set of conventions, documented in `course-api/CLAUDE.md`. When reviewing a route, a store change, or a test — or writing a new one — check it against these before anything more general:

1. **One route file per resource.** A resource's routes live in one file under `routes/` (e.g. `users.js`) and are mounted in `server.js` under their base path. A new resource that doesn't get a route file, or a route bolted onto an unrelated file, is a convention violation even if it works.
2. **State only through `db/store.js`.** Routes never hold state directly (no module-level arrays/objects in a route file). Every read or write of persisted data goes through the store helper. Flag any route that reaches around it.
3. **Input validation lives in the route.** Bad input returns `400`; a missing record returns `404`. Check every route parameter and body field that the handler actually uses — an unvalidated field that later causes a `500` or a silent wrong result is a bug, not a style nit.
4. **Error shape is `{ "error": "message" }`.** Every error response — validation failures, not-found, unexpected errors — should return JSON in exactly this shape. A route that throws an unhandled exception (crashing to Express's default HTML error page) or returns a different shape should be flagged.
5. **Tests exercise the contract, not the implementation.** A good test for a route hits it through `supertest` and asserts on status code and response body — the same contract a real client depends on. When adding tests, prefer covering the validation and error-shape rules above; they're the most common source of regressions in this codebase.

When these checks turn up nothing, say so plainly rather than inventing minor style feedback — a clean review is a valid result.
