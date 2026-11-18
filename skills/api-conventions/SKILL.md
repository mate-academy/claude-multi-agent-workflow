---
name: api-conventions
description: Use when writing, editing, or reviewing Express route handlers, request validation, error responses, or data access in this API — for example adding a new endpoint or resource, or deciding which status code to return.
---

# API conventions

Follow these when adding or changing routes.

- **One router per resource.** Put it in `routes/<resource>.js`, export an Express router, and mount it in `server.js` under its base path.
- **Data goes through the store.** Read and write only via `db/store.js`; routes never hold state.
- **Validate in the route.** Check required fields and types before touching the store. Convert `:id` with `Number()` and treat `NaN` as bad input.
- **Status codes:**
  - `200` for reads and updates
  - `201` for a created record
  - `400` for invalid input
  - `404` for a missing record
- **Errors are JSON** shaped `{ "error": "message" }`, never plain text or HTML.
- **Every route gets tests** in `tests/` covering success, 400, and 404.

When unsure, match an existing route in `routes/users.js`.
