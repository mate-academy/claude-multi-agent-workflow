---
name: api-conventions
description: The conventions of the course-api Express project. Use when writing, reviewing, or fixing code under course-api/ — adding a route, changing validation, touching the data store, or deciding on a status code / error shape.
---

# course-api conventions

Apply these whenever you touch code under `course-api/`.

## Structure

- `server.js` — entry point: creates the Express app, mounts routers, listens.
- `routes/<resource>.js` — one file per resource, each exporting an Express router,
  mounted in `server.js` under its base path (`/users`, `/health`).
- `db/store.js` — the in-memory data helper. **All** state lives here; routes read
  and write only through its functions (`listUsers`, `getUser`, `createUser`,
  `updateUser`, `reset`). Routes never hold state directly.

## Rules

- **Validate in the route.** Return `400` on bad/missing input, `404` when a record
  doesn't exist, `201` on successful create, `200` otherwise.
- **Error shape is always** `{ "error": "message" }` as JSON.
- Coerce `:id` params with `Number(...)` before passing to the store.
- CommonJS only (`require` / `module.exports`), no ESM. Don't add dependencies —
  the project uses only `express` (plus `eslint`/`supertest` as dev deps).

## Adding a new resource

1. Create `routes/<name>.js` exporting a router.
2. Add the matching store helpers in `db/store.js`.
3. Mount it in `server.js` with `app.use('/<name>', <name>Router)`.
4. Add tests in `tests/<name>.test.js` and reset the store in `beforeEach`.

## Verifying

From `course-api/`: `npm test` (Node's built-in runner) and `npm run lint`
(ESLint) must both pass.
