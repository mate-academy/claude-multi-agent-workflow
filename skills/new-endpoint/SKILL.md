---
name: new-endpoint
description: Scaffold a new Express resource in course-api (route file, db/store.js helpers, and a test file) that follows the project's conventions from the start. Use when adding a brand-new resource/endpoint to course-api, as opposed to reviewing or fixing existing code.
---

Use this skill when the user wants to add a new resource to `course-api` (e.g. "add a `/products` endpoint", "add a notes resource"). It scaffolds convention-compliant code up front, so `convention-auditor` never has anything to flag on it later.

## Steps

1. Read `course-api/CLAUDE.md` and the existing `routes/users.js` + `db/store.js` to confirm the current conventions and patterns before generating anything new — don't rely on this file's memory of them.
2. Add data-layer helpers for the new resource to `course-api/db/store.js` (or a new file next to it if the user's project has since split it up), following the existing pattern: an in-memory array, an incrementing id, `list*`/`get*`/`create*`/`update*` functions, and inclusion in `reset()`'s reseed so tests stay isolated.
3. Create `course-api/routes/<resource>.js` exporting an Express `Router`, with handlers that:
   - only read/write through the new `db/store.js` helpers — never hold local state,
   - return `400` on missing/invalid required fields, `404` when a looked-up record doesn't exist,
   - shape every error response as `{ "error": "message" }`.
4. Mount the new router in `course-api/server.js` under its base path, matching how `usersRouter` and `healthRouter` are mounted.
5. Add `course-api/tests/<resource>.test.js` following `tests/users.test.js`'s pattern (Node's built-in `node:test` + `assert`, `supertest` against the exported `app`, `test.beforeEach(() => store.reset())`), covering at minimum: list, get-by-id 404, create success, create validation failure, update success, update 404.
6. Run `npm test` from `course-api/` to confirm the new tests pass and nothing else broke.

## After scaffolding

Tell the user to run the `convention-auditor` subagent (or `/code-quality-check`) against the new files as a second opinion — this skill writes conventions-compliant code by construction, but a fresh review catches anything the scaffold missed (e.g. a field name typo, an edge case the user described that wasn't captured).
