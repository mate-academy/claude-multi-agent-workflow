---
name: express-test-patterns
description: Use when writing or reviewing tests for a small Express + node:test + supertest API like this one — covers the request/response shapes, status-code conventions, and beforeEach reset pattern this codebase expects so new tests match existing style instead of inventing a new one.
---

# Express test patterns for this API

This skill captures the testing conventions used across the `course-api/`-style Express services this plugin targets. Load it whenever you're writing, editing, or reviewing tests so the output matches the codebase instead of introducing a new style.

## Stack

- Test runner: Node's built-in `node:test` (`npm test` runs `node --test`).
- HTTP assertions: `supertest`, driven against the exported `app` (never a real listening port).
- Assertions: `node:assert` (`assert.equal`, `assert.ok`, `assert.deepEqual`).

## Required setup in every test file

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

The `beforeEach(() => store.reset())` line is not optional — the in-memory store persists across tests in the same file, so omitting it makes tests order-dependent and flaky.

## Conventions to assert against

- **Status codes**: `200` for successful reads/updates, `201` for creates, `400` for bad/missing input, `404` for a record that doesn't exist. A route that returns something else for these cases is a bug, not a style choice.
- **Error shape**: errors are always JSON `{ "error": "message" }` — assert on `res.body.error`, not just the status code, when testing a failure path.
- **One `test(...)` per behavior**, named for what it verifies (e.g. `'PUT /users/:id returns 404 for a missing user'`), not per endpoint — an endpoint with three branches gets three tests.

## What to prioritize when covering gaps

When asked to close a coverage gap, prefer, in order:
1. The error/edge path (missing input, missing record, wrong type) — these are the most commonly skipped and most likely to hide real bugs.
2. Boundary values for anything user-supplied (empty string, `0`, negative IDs).
3. The happy path, if it genuinely isn't covered yet.

Don't weaken an assertion just to make a new test pass — a failing test that exposes a real bug is more valuable than a green one that doesn't check anything.
