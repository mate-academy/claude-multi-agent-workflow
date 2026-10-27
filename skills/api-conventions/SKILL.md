---
name: api-conventions
description: Conventions for adding or changing routes in a small Express API (routes/, db/store.js, 400/404 errors as { error }). Use when asked to add, create, change or fix an endpoint, route or resource, or when writing request validation or error responses.
---

# Express API conventions

Follow these rules whenever you add or change an endpoint:

1. **One file per resource** in `routes/<resource>.js`, exporting an
   `express.Router()`. A new resource is mounted in `server.js` with
   `app.use("/<resource>", router)`.
2. **Comment every route** with one line above it:
   `// METHOD /path — what it does`.
3. **All data access goes through `db/store.js`.** Routes never keep state.
   Add a store function if one is missing.
4. **Validate input in the route.**
   - bad or missing input → `400` with `{ "error": "<what is wrong>" }`
   - record not found → `404` with `{ "error": "<Resource> not found" }`
   - ids from the URL: convert with `Number()` and reject non-integers with 400.
5. **Success codes:** `200` read, `201` create (return the new record),
   `204` delete (no body).
6. **Add tests** in `tests/` with `node:test` + `supertest`: one for the happy
   path and one per error case. Run `npm test` and `npm run lint` before finishing.
