---
name: express-conventions
description: Fires when writing, reviewing, or adding a new Express route handler or route file. Describes the conventions every route file in this project must follow.
---

# Express route conventions

## File skeleton

```js
const express = require('express');
const store = require('../db/store');   // always through the store — never direct state

const router = express.Router();

// [VERB] /[path] — [one-line description of what this handler does]
router.get('/', (req, res) => {
  res.json(store.listX());
});

module.exports = router;
```

## Rules

**Data access** — all reads and writes go through `db/store.js` helper functions. Routes never hold or mutate state directly.

**Validation** — POST and PUT handlers validate required fields before touching the store:
```js
if (!name || !email) {
  return res.status(400).json({ error: 'name and email are required' });
}
```

**Not-found** — any handler that looks up a record by id must handle the missing case:
```js
const item = store.getItem(id);
if (!item) return res.status(404).json({ error: 'Item not found' });
```

**Error shape** — every error response is `{ "error": "message" }`. No other shapes.

**Handler comments** — each `router.verb(...)` call has a one-line comment directly above it in the format `// VERB /path — description`.

**Exports** — every route file ends with `module.exports = router`.
