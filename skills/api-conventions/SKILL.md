---
name: api-conventions
description: The house rules for Express endpoints in this codebase - status codes, the { "error" } shape, validation order, and store-only data access. Use when writing, changing, or reviewing an endpoint, route handler, or API error response.
---

# API conventions

- **Data** is read and written only through the store module (`db/store.js`). A route never keeps its own state.
- **Ids** are converted with `Number(req.params.id)`. A missing record returns `404 { "error": "<Thing> not found" }`. This check comes first, so an unknown id is always a 404.
- **Input** is validated in the route. Bad or missing fields return `400 { "error": "<what is required>" }`.
- **Every error** response is JSON with exactly one key, `error`, holding a sentence a client developer can act on.
- **Success status:** `201` plus the created object for a create, `200` plus the object for a read or update, and `204` with no body for a delete.
- **Every endpoint** has supertest tests covering success, 404 and 400. The tests use `store.reset()` in `beforeEach`.
- **`docs/api.md`** changes in the same PR as the endpoint.
