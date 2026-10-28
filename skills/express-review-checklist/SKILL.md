---
name: express-review-checklist
description: Use when reviewing or writing route, controller, or data-access code in course-api/ (or any Express API following the same conventions) — a checklist of this codebase's specific rules for input validation, status codes, error shape, and data access.
---

# Express route review checklist

Check every route or db-access change against these rules, taken from this codebase's own conventions (see `course-api/CLAUDE.md`):

1. **Input validation** — the route validates its input before touching the data layer, and returns `400` on bad input.
2. **Missing records** — looking up a record that doesn't exist returns `404`, not a 500 or an empty 200.
3. **Error shape** — every error response is JSON shaped exactly `{ "error": "message" }`, not a bare string or a different key.
4. **Data access boundary** — routes never hold or mutate state directly; all reads/writes go through `db/store.js`.
5. **One file per resource** — a new resource gets its own file under `routes/`, mounted in `server.js` under its base path, rather than being added to an existing resource's file.
6. **Async correctness** — any call into `db/store.js` or other async work is properly awaited; no dropped promises or unhandled rejections.

When reviewing, flag any violation of 1–6 as a finding. When writing new routes, satisfy all six before considering the route done.
