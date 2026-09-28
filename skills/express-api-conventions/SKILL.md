---
name: express-api-conventions
description: Conventions for writing and testing routes in small Express APIs that use an in-memory store (routes/, db/store.js, node:test + supertest). Use when adding or changing an Express route, writing API tests, or checking whether a route follows the project's validation and error-shape rules.
---

# Express API conventions

Apply these rules when you add a route, change one, or write tests for one. If the project has a `CLAUDE.md`, it wins over anything here.

## Routes

- One router file per resource in `routes/<resource>.js`, exporting an `express.Router()`; mount it in `server.js` under `/<resource>`.
- All data access goes through `db/store.js`. A route never keeps its own arrays or counters.
- Parse ids once: `const id = Number(req.params.id)`. Treat `Number.isNaN(id)` as "not found" (`404`), not as a crash.
- Validate the body before calling the store. Bad or missing input → `400`.
- Missing record → `404`. Created → `201` with the new record. Everything else successful → `200`.
- Every error body is JSON shaped exactly `{ "error": "<human message>" }`.
- Always `return res...` so no code runs after a response is sent.

## Tests

- Runner: Node's built-in `node:test` with `node:assert`; HTTP via `supertest` against the exported `app` (never `listen`).
- Reset state before every test: `test.beforeEach(() => store.reset());`
- Name tests `'<METHOD> <path> <expected outcome>'`, e.g. `'POST /users returns 400 when email is missing'`.
- For every route cover: the happy path, each `400` validation branch, and the `404` branch.
- Assert the status **and** the body (`res.body.error` for failures, the relevant fields for successes).
- A test that proves an existing bug is kept, marked `{ todo: 'known bug: …' }`, and reported — don't change app code to make it pass unless asked.

## Template

```js
test('GET /widgets/:id returns 404 for a missing widget', async () => {
  const res = await request(app).get('/widgets/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Widget not found' });
});
```

## Checklist before you finish

- [ ] `npm test` passes (todos allowed, failures not).
- [ ] `npm run lint` reports no errors.
- [ ] New route documented in the project's API docs (e.g. `docs/api.md`), if it has them.
