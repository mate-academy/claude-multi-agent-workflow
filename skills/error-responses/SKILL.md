---
name: error-responses
description: The error response format for the course API. Use when writing or reviewing a route that returns an error, or a test that checks one.
---

# Error responses

Every error from the API is JSON with a single `error` field:

```json
{ "error": "message" }
```

## Rules
- Always send it with `res.status(code).json({ error: '...' })`. Never send plain text or HTML.
- No extra fields (no `code`, `details`, or stack traces).
- Use `400` for bad input (a required field is missing), with a message that names the field, for example `name and email are required`.
- Use `404` when a record does not exist, for example `User not found`.
- Validate in the route, before calling `db/store.js`.

## Example

```js
const user = store.getUser(Number(req.params.id));
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}
```

## In tests
Check both the status code and the body: `assert.deepStrictEqual(res.body, { error: 'User not found' })`.
