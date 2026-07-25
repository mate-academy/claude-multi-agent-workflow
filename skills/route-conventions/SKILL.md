---
name: route-conventions
description: Use whenever adding, moving, or restructuring an Express route in course-api (or a similarly-shaped Express app) — one file per resource, validation and status codes, error response shape, and where data access is allowed to happen. Load this before writing a new route handler, not after, so the new code matches existing ones instead of drifting.
---

# Route conventions

This project (`course-api`) follows a small, consistent shape for every route. When adding or changing a route, match it exactly rather than inventing a new pattern.

## File layout

- One file per resource under `routes/` (e.g. `users.js`, `health.js`), each exporting an `express.Router()`.
- The router is mounted in `server.js` under its base path — a new resource needs both a new file *and* a mount line, not just the file.
- Routes never hold state directly. All reads and writes go through `db/store.js`. If a route needs new persistence behavior, add it to the store, don't reach into storage internals from the route.

## Validation and status codes

- Validate required input in the route handler itself, before calling the store.
- Missing or invalid input → `400`.
- A record that doesn't exist (e.g. bad `:id`) → `404`.
- Success → `200` (read/update) or `201` (create), returning the resulting resource as JSON.

## Error shape

Every error response is JSON in the exact shape `{ "error": "message" }` — no extra fields, no arrays, no nested error objects. Match the wording style already used in sibling routes (e.g. `"name and email are required"`, `"User not found"`).

## Template

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

router.get('/:id', (req, res) => {
  const item = store.getThing(Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Thing not found' });
  }
  return res.json(item);
});

module.exports = router;
```

## After writing a route

A new or changed route almost always needs a matching test and a quality pass — don't stop at the handler. Point the `code-reviewer` and `test-writer` subagents (or run `/audit`) at the file once it's in place, rather than reviewing or testing it yourself inline.
