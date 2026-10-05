---
name: course-api-conventions
description: Conventions for the Express course API — use when adding or changing a route, a store function, or a test, so the code follows the project's validation, error and data-access rules.
---

# Course API conventions

- One route file per resource in `routes/`; mount it in `server.js` under its base path.
- All data access goes through `db/store.js`. Routes never hold state directly.
- Validate input in the route. Return `400` on bad input and `404` when a record is missing.
- Error responses are JSON: `{ "error": "message" }`.
- Convert and check path ids before use: `Number(req.params.id)` can be `NaN`.

## Test template (Node's built-in runner)

```js
const test = require('node:test');
const assert = require('node:assert');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('describes one behavior', () => {
  assert.strictEqual(store.getUser(999), undefined);
});
```

Run with `npm test`; lint with `npm run lint`, both from `course-api/`.
