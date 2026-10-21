---
name: api-conventions
description: Conventions for the Express API in course-api. Use when adding or changing a route, validating input, or shaping an error response.
---

# API conventions

- One route file per resource in `routes/`; mount it in `server.js` under its base path.
- All data access goes through `db/store.js`. Routes never hold state directly.
- Validate input in the route. Respond `400` on bad input and `404` when a record is missing.
- Error responses are JSON shaped `{ "error": "message" }`.
- Return after sending a response (`return res.status(...).json(...)`) so no code runs twice.

When a change breaks one of these, fix it in the route rather than adding a special case elsewhere.
