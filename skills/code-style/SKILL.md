---
name: code-style
description: Code style and API conventions for the course Express API. Use when writing, editing, or reviewing route handlers, the data store, or tests in course-api/.
---
# Code style for the course API

Follow these rules whenever you write or change code in course-api/.

## Formatting
- Indent with 2 spaces, never tabs.
- Use single quotes and end statements with semicolons.
- CommonJS modules: `require(...)` and `module.exports`, not `import`/`export`.

## Routes
- One file per resource in `routes/`, exporting an Express router; mount it in `server.js` under its base path.
- Put a one-line comment above each handler naming the method, path, and what it does, e.g. `// GET /users/:id — fetch one user, or 404 if it doesn't exist.`
- Validate input at the top of the handler and `return` early on failure.
- Convert path params before use: `Number(req.params.id)`.

## Status codes and errors
- `400` for missing or invalid input, `404` when a record doesn't exist, `201` with the new record on create.
- Every error response is JSON in the shape `{ "error": "message" }`, for example:
  `return res.status(404).json({ error: 'User not found' });`

## Data access
- All reads and writes go through `db/store.js`; routes never hold state.
- Store helpers return `undefined` when a record is missing, and the route turns that into a `404`.

## Before you finish
- Run `npm run lint` and `npm test` in course-api/ and fix anything they report.
