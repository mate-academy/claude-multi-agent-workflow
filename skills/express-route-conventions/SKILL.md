---
name: express-route-conventions
description: Conventions for writing or reviewing Express routes in this API — one router per resource, data access through db/store.js, input validation with 400/404, and JSON error shape. Use when adding, editing, or reviewing a route, or when asked "does this follow our conventions?".
---

# Express route conventions

Apply these rules whenever you create or review a route in `course-api/`.

## Structure
- One file per resource in `routes/`, exporting an Express router.
- Mount each router in `server.js` under its base path.
- Routes never hold state: all reads and writes go through `db/store.js`.

## Validation and status codes
- Validate input inside the route; return `400` on bad or missing input.
- Return `404` when a requested record does not exist.
- Use `201` for successful creation and `204` for successful deletion with no body.

## Error shape
Every error response is JSON: `{ "error": "message" }`. Never send plain text or stack traces.

## Checklist before finishing
1. Is the router mounted in `server.js`?
2. Does every handler validate its input and handle the missing-record case?
3. Do all errors use the `{ "error": "..." }` shape?
4. Is there a test in `tests/` covering success, `400`, and `404`?
5. Does `npm run lint` pass?
