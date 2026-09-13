---
name: api-conventions
description: The course-api project's routing, validation, and error-response conventions. Use when reviewing, writing, or fixing code under routes/ or db/store.js.
---

course-api is a small Express API. Conventions to follow whenever touching `routes/` or `db/store.js`:

- **One route file per resource**, mounted under its own base path in `server.js` (e.g. `routes/users.js` → `/users`).
- **All data access goes through `db/store.js`.** Routes never hold state directly — no module-level arrays/objects in a route file.
- **Validate input in the route.** Bad input returns `400`; a request for a record that doesn't exist returns `404`.
- **Error shape is fixed:** every error response body is exactly `{ "error": "message" }` — no extra fields, no HTML, no stack traces leaked to the client.

Checklist when reviewing a route file:
1. Does it import from `db/store.js` for every read/write, or does it keep its own state?
2. Does every 4xx path return the `{ "error": "message" }` shape?
3. Is validation done before touching the store, not after?
4. Is the route mounted in `server.js` under a sensible base path?
