---
name: code-quality-checklist
description: Use before or while reviewing changed code in course-api (or writing new routes/tests) — a checklist of this project's quality conventions to check against, so reviews are consistent instead of ad hoc.
---

# Code quality checklist (course-api)

Check changed code against these, in order:

1. **Route/data-access split** — routes never hold state directly; all reads and writes go through `db/store.js`. A route file computing or storing data on its own is a violation.
2. **Input validation** — every route that accepts a body validates the fields it needs and returns `400` with `{ "error": "message" }` when they're missing or malformed, before touching the store.
3. **Not-found handling** — any lookup by id returns `404` with `{ "error": "message" }` when the record doesn't exist, not a `200` with `null`/`undefined`, and not an unhandled exception.
4. **Error shape** — every error response is `{ "error": "message" }`. No stray formats (plain strings, stack traces, differently-cased keys).
5. **One file per resource** — a new resource gets its own file under `routes/`, mounted in `server.js` under its base path, not folded into an existing resource's file.
6. **Naming** — function and variable names say what they do; a reviewer shouldn't need to read the body to guess.
7. **Test coverage** — for every new status code a route can return (200/201/400/404/etc.), there's a test that exercises it. A route with only a happy-path test is under-covered.

When reviewing, cite the specific item number a finding violates — it keeps findings falsifiable instead of vibes-based, and makes it obvious when a "finding" is really just a style preference outside this list.
