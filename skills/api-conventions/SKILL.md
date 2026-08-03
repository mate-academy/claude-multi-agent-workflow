---
name: api-conventions
description: The house rules for the Express API in course-api/ — route layering, validation, status codes, and the error response shape. Load this before adding or changing an endpoint, reviewing a route, or writing tests against one, so new code matches what's already there instead of inventing a second style.
---

# API conventions

House rules for `course-api/`. They are not style preferences — each one exists because
breaking it produces a real defect. Follow them when writing, reviewing, or testing a
route.

## Layering

**Every route reads and writes through `db/store.js`.** Routes never hold state
themselves and never reach around the store. The whole point is that swapping the
in-memory store for a real database touches one file.

If a route needs data the store doesn't expose, add a helper to `db/store.js` and call
it — don't reach past the store to get at the data another way.

One file per resource in `routes/`, each exporting an Express router, mounted in
`server.js` under its base path.

## Validation

Validate input in the route, before touching the store.

- Missing required fields on create → `400`.
- An update with no updatable fields at all → `400`.
- Path params arrive as **strings**. Coerce before use: `Number(req.params.id)`.
  `store.getUser('1')` will not match `{ id: 1 }`, and the bug shows up as a mystery
  `404` rather than as a type error.

## Status codes

| Situation | Status |
| --- | --- |
| Read succeeded | `200` |
| Update succeeded | `200` |
| Create succeeded | `201` |
| Bad or missing input | `400` |
| Record doesn't exist | `404` |

A store helper returning `undefined` means *not found* — turn it into a `404`. Never let
it fall through to a `200` with an empty body.

## Error shape

Every error response is exactly:

```json
{ "error": "message" }
```

One key, `error`, with a human-readable string. No `message`, no `status` field, no
nested `error.detail` object. Clients parse this shape and nothing else.

```js
// Right
return res.status(404).json({ error: 'User not found' });

// Wrong — a second error shape clients now have to handle
return res.status(404).json({ message: 'not found', code: 404 });
```

Return early on the error path so the success path stays unindented.

## Don't hand out live internal state

Store helpers must not return a reference a caller can mutate. `listUsers()` returning
the internal `users` array means any caller can push to the store without going through
a helper — which quietly defeats the layering rule above. Return a copy.

## Tests

Tests live in `course-api/tests/`, one file per resource, using Node's built-in runner
with `supertest`:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

- `store.reset()` in `beforeEach` — every test starts from seed data.
- Tests are independent: no ordering assumptions, no reliance on ids another test made.
- Assert on **status and body**, including that errors come back as `{ error: '...' }`.
- Each endpoint wants the happy path, the `400`, and the `404`.
- No new test frameworks. `node --test` and `supertest` are what this project uses.

## Commands

```bash
cd course-api
npm test        # node --test
npm run lint    # eslint server.js routes db tests
npm run dev     # start on port 3000
```
