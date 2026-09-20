---
name: api-conventions
description: The house rules for this Express API — status codes, error shape, and where state is allowed to live. Load before reviewing, writing, or editing anything under routes/ or db/, so changes get judged against this project's actual convention instead of generic REST intuition.
---

# API conventions

This project is small and in-memory on purpose. These rules keep it consistent as it grows — follow them when writing a route, and check for them when reviewing one.

## Status codes
- Bad input (missing or malformed fields) → `400`.
- A record that doesn't exist → `404`.
- Never let a route fall through to a default `200` on a failure path, and never surface an unexpected error as anything but a `4xx`/`5xx` — silently returning `200` with empty/null data hides bugs from callers.

## Error shape
Every error response is JSON in exactly this shape:
```json
{ "error": "message" }
```
No extra fields, no arrays of errors, no `success: false` wrapper — one string under `error`.

## Where state lives
- All reads and writes go through the data-access layer (`db/store.js`). Routes never hold arrays/objects of their own or mutate module-level state directly.
- If a route needs a new query or mutation, add a function to the data-access layer rather than reaching into its internals from the route file.

## File layout
- One route file per resource, exporting an Express router, mounted in `server.js` under its own base path.
- Don't merge two resources into one route file, even a small one — split it instead.

## Docs stay truthful
`docs/api.md` should always describe what the routes actually do. If a route's status codes, required fields, or response shape change, the doc entry for that endpoint changes in the same pass — don't let it drift and rely on someone syncing it later.
